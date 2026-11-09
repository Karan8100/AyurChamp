"""Vikriti (weekly check-in) API — tracks transient dosha imbalances over time."""

from collections import Counter
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.cache import memory_cache
from app.core.deps import get_current_user
from app.data.vikriti_questions import (
    VIKRITI_QUESTIONS,
    compute_aggravation,
    most_aggravated,
)
from app.db.session import get_session
from app.models import AssessmentSession, User, VikritiCheckin, VikritiResponse
from app.schemas import (
    OptionOut,
    QuestionOut,
    VikritiAnswerIn,
    VikritiAnswerOut,
    VikritiHistoryItem,
    VikritiHistoryResponse,
    VikritiProgressionPoint,
    VikritiProgressionResponse,
    VikritiResultOut,
    VikritiStartOut,
)
from app.services.prakriti_scoring import compute_scores

router = APIRouter(prefix="/vikriti", tags=["vikriti"])


def _serialize_question(q: dict) -> QuestionOut:
    return QuestionOut(
        id=q["id"],
        phase=1,
        domain=q.get("domain"),
        source_note="Dashavidha Pariksha (Charaka Samhita Vimana Sthana)",
        text=q["text"],
        image=None,
        options=[OptionOut(**opt) for opt in q["options"]],
    )


@router.post("/start", response_model=VikritiStartOut)
async def start_vikriti(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Start a new weekly Vikriti check-in session."""
    checkin_id = None
    try:
        checkin = VikritiCheckin(
            user_id=current_user.id,
            status="in_progress",
            vata_score=0.0,
            pitta_score=0.0,
            kapha_score=0.0,
            vata_delta=0.0,
            pitta_delta=0.0,
            kapha_delta=0.0,
            most_aggravated="vata",
            created_at=datetime.utcnow(),
        )
        session.add(checkin)
        await session.commit()
        await session.refresh(checkin)
        checkin_id = checkin.id
    except Exception as e:
        await session.rollback()
        if current_user.role == "guest":
            try:
                g = await session.get(User, 0)
                if not g:
                    session.add(User(id=0, name="Guest Evaluator", email="guest@ayushya.org", role="guest", is_active=True))
                    await session.commit()
                checkin = VikritiCheckin(user_id=0, status="in_progress")
                session.add(checkin)
                await session.commit()
                await session.refresh(checkin)
                checkin_id = checkin.id
            except Exception:
                await session.rollback()
                checkin_id = int(datetime.utcnow().timestamp())
        else:
            raise HTTPException(500, f"Could not start Vikriti check-in: {e}")

    all_qs = [_serialize_question(q) for q in VIKRITI_QUESTIONS]
    return VikritiStartOut(
        checkin_id=checkin_id or 1,
        question=all_qs[0],
        all_questions=all_qs,
        total_questions=len(all_qs),
    )


@router.post("/{checkin_id}/answer", response_model=VikritiAnswerOut)
@router.post("/answer", response_model=VikritiAnswerOut)
async def submit_vikriti_answer(
    payload: VikritiAnswerIn,
    checkin_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Record an answer for the Vikriti check-in.
    
    Walks linearly through all 10 questions in order. On question 10,
    computes scores, aggravation deltas against baseline Prakriti, and completes the check-in.
    """
    if checkin_id is None:
        raise HTTPException(400, "checkin_id is required")

    checkin = await session.get(VikritiCheckin, checkin_id)
    if not checkin or checkin.user_id != current_user.id:
        raise HTTPException(404, "Vikriti check-in not found")
    if checkin.status == "completed":
        return VikritiAnswerOut(
            checkin_id=checkin_id,
            status="completed",
            result=VikritiResultOut(
                checkin_id=checkin_id,
                vata_score=checkin.vata_score,
                pitta_score=checkin.pitta_score,
                kapha_score=checkin.kapha_score,
                vata_delta=checkin.vata_delta,
                pitta_delta=checkin.pitta_delta,
                kapha_delta=checkin.kapha_delta,
                most_aggravated=checkin.most_aggravated,
                created_at=checkin.created_at,
            ),
        )

    # Verify question exists
    q_matches = [q for q in VIKRITI_QUESTIONS if q["id"] == payload.question_id]
    if not q_matches:
        raise HTTPException(400, f"Unknown question_id: {payload.question_id}")
    if payload.selected_dosha not in ("vata", "pitta", "kapha"):
        raise HTTPException(400, f"Invalid selected_dosha: {payload.selected_dosha}")

    # Check for existing response to this question in this check-in (allow updating)
    existing = await session.exec(
        select(VikritiResponse).where(
            VikritiResponse.checkin_id == checkin_id,
            VikritiResponse.question_id == payload.question_id,
        )
    )
    existing_rec = existing.first()
    if existing_rec:
        existing_rec.selected_dosha = payload.selected_dosha
        session.add(existing_rec)
    else:
        response_rec = VikritiResponse(
            checkin_id=checkin_id,
            question_id=payload.question_id,
            selected_dosha=payload.selected_dosha,
            created_at=datetime.utcnow(),
        )
        session.add(response_rec)
    await session.flush()

    # Get all responses for this checkin
    all_responses_res = await session.exec(
        select(VikritiResponse).where(VikritiResponse.checkin_id == checkin_id)
    )
    all_responses = all_responses_res.all()
    answered_count = len(all_responses)

    # 1. More questions to answer
    if answered_count < len(VIKRITI_QUESTIONS):
        next_question = VIKRITI_QUESTIONS[answered_count]
        await session.commit()
        return VikritiAnswerOut(
            checkin_id=checkin_id,
            status="in_progress",
            next_question=_serialize_question(next_question),
            result=None,
        )

    # 2. Check-in complete: compute scores & aggravation deltas
    counts = Counter(r.selected_dosha for r in all_responses)
    vikriti_scores = compute_scores(counts)

    # Query latest completed Prakriti assessment for baseline scores
    prakriti_res = await session.exec(
        select(AssessmentSession)
        .where(
            AssessmentSession.user_id == current_user.id,
            AssessmentSession.status == "completed",
        )
        .order_by(AssessmentSession.started_at.desc())
    )
    prakriti_session = prakriti_res.first()
    if prakriti_session and prakriti_session.vata_score is not None:
        prakriti_scores = {
            "vata": prakriti_session.vata_score,
            "pitta": prakriti_session.pitta_score or 0.0,
            "kapha": prakriti_session.kapha_score or 0.0,
        }
    else:
        # Balanced baseline fallback if user hasn't completed Prakriti
        prakriti_scores = {"vata": 33.33, "pitta": 33.33, "kapha": 33.33}

    aggravation_deltas = compute_aggravation(prakriti_scores, vikriti_scores)
    most_elevated = most_aggravated(aggravation_deltas)

    # Update check-in record
    checkin.vata_score = vikriti_scores["vata"]
    checkin.pitta_score = vikriti_scores["pitta"]
    checkin.kapha_score = vikriti_scores["kapha"]
    checkin.vata_delta = aggravation_deltas["vata"]
    checkin.pitta_delta = aggravation_deltas["pitta"]
    checkin.kapha_delta = aggravation_deltas["kapha"]
    checkin.most_aggravated = most_elevated
    checkin.status = "completed"
    checkin.created_at = datetime.utcnow()

    session.add(checkin)
    await session.commit()
    await session.refresh(checkin)
    memory_cache.clear_for_user(current_user.id)

    result_out = VikritiResultOut(
        checkin_id=checkin.id,
        vata_score=checkin.vata_score,
        pitta_score=checkin.pitta_score,
        kapha_score=checkin.kapha_score,
        vata_delta=checkin.vata_delta,
        pitta_delta=checkin.pitta_delta,
        kapha_delta=checkin.kapha_delta,
        most_aggravated=checkin.most_aggravated,
        created_at=checkin.created_at,
        days_ago=0,
        is_stale=False,
    )

    return VikritiAnswerOut(
        checkin_id=checkin_id,
        status="completed",
        next_question=None,
        result=result_out,
    )


@router.get("/latest", response_model=Optional[VikritiResultOut])
async def get_latest_vikriti(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Fetch the user's most recent completed Vikriti check-in, or null if none."""
    cache_key = f"vikriti_latest:{current_user.id}"
    if memory_cache.has(cache_key):
        return memory_cache.get(cache_key)

    if current_user.role == "guest":
        memory_cache.set(cache_key, None, ttl_seconds=300)
        return None

    query = (
        select(VikritiCheckin)
        .where(
            VikritiCheckin.user_id == current_user.id,
            VikritiCheckin.status == "completed",
        )
        .order_by(VikritiCheckin.created_at.desc())
    )
    result = await session.exec(query)
    checkin = result.first()
    if not checkin:
        memory_cache.set(cache_key, None, ttl_seconds=300)
        return None


    days_ago = (datetime.utcnow() - checkin.created_at).days
    latest_out = VikritiResultOut(
        checkin_id=checkin.id,
        vata_score=checkin.vata_score,
        pitta_score=checkin.pitta_score,
        kapha_score=checkin.kapha_score,
        vata_delta=checkin.vata_delta,
        pitta_delta=checkin.pitta_delta,
        kapha_delta=checkin.kapha_delta,
        most_aggravated=checkin.most_aggravated,
        created_at=checkin.created_at,
        days_ago=days_ago,
        is_stale=days_ago > 10,
    )
    memory_cache.set(cache_key, latest_out, ttl_seconds=300)
    return latest_out



def _classify_deviation(deviation_index: float):
    if deviation_index <= 10.0:
        return "sama", "Sama Dosa (Optimal Homeostasis)"
    elif deviation_index <= 25.0:
        return "alpa", "Alpa Vikriti (Mild Seasonal Fluctuation)"
    elif deviation_index <= 45.0:
        return "madhyama", "Madhyama Vikriti (Moderate Dosha Aggravation)"
    else:
        return "teevra", "Teevra Vikriti (Acute Dosha Vitiation)"


def _get_demo_progression() -> VikritiProgressionResponse:
    today = datetime.utcnow()
    points = [
        VikritiProgressionPoint(
            checkin_id=101,
            date=(today - timedelta(days=35)).strftime("%Y-%m-%d"),
            week_label="Week 1",
            vata_score=20.0,
            pitta_score=64.0,
            kapha_score=16.0,
            vata_delta=-1.0,
            pitta_delta=18.0,
            kapha_delta=-17.0,
            most_aggravated="pitta",
            deviation_index=36.0,
            clinical_milestone="Severe heartburn & skin breakouts post-Grishma solstice",
        ),
        VikritiProgressionPoint(
            checkin_id=102,
            date=(today - timedelta(days=28)).strftime("%Y-%m-%d"),
            week_label="Week 2",
            vata_score=22.0,
            pitta_score=58.0,
            kapha_score=20.0,
            vata_delta=1.0,
            pitta_delta=12.0,
            kapha_delta=-13.0,
            most_aggravated="pitta",
            deviation_index=26.0,
            clinical_milestone="Activated Pitta-Shamak Diet (Coconut, Coriander, Bitter Greens)",
        ),
        VikritiProgressionPoint(
            checkin_id=103,
            date=(today - timedelta(days=21)).strftime("%Y-%m-%d"),
            week_label="Week 3",
            vata_score=23.0,
            pitta_score=52.0,
            kapha_score=25.0,
            vata_delta=2.0,
            pitta_delta=6.0,
            kapha_delta=-8.0,
            most_aggravated="pitta",
            deviation_index=16.0,
            clinical_milestone="Introduced Sheetali Pranayama & Night Pada Abhyanga",
        ),
        VikritiProgressionPoint(
            checkin_id=104,
            date=(today - timedelta(days=14)).strftime("%Y-%m-%d"),
            week_label="Week 4",
            vata_score=22.0,
            pitta_score=48.0,
            kapha_score=30.0,
            vata_delta=1.0,
            pitta_delta=2.0,
            kapha_delta=-3.0,
            most_aggravated="pitta",
            deviation_index=6.0,
            clinical_milestone="Complete digestive remission; Agni normalized to Sama state",
        ),
        VikritiProgressionPoint(
            checkin_id=105,
            date=(today - timedelta(days=7)).strftime("%Y-%m-%d"),
            week_label="Week 5",
            vata_score=24.0,
            pitta_score=47.0,
            kapha_score=29.0,
            vata_delta=3.0,
            pitta_delta=1.0,
            kapha_delta=-4.0,
            most_aggravated="vata",
            deviation_index=8.0,
            clinical_milestone="Varsha Ritu transition; slight joint stiffness noted",
        ),
        VikritiProgressionPoint(
            checkin_id=106,
            date=today.strftime("%Y-%m-%d"),
            week_label="Week 6 (Current)",
            vata_score=22.0,
            pitta_score=46.0,
            kapha_score=32.0,
            vata_delta=1.0,
            pitta_delta=0.0,
            kapha_delta=-1.0,
            most_aggravated="vata",
            deviation_index=2.0,
            clinical_milestone="Tridoshic Homeostasis Achieved (Deviation < 3%)",
        ),
    ]
    level, label = _classify_deviation(2.0)
    return VikritiProgressionResponse(
        baseline_prakriti={
            "vata": 21.0,
            "pitta": 46.0,
            "kapha": 33.0,
            "result_type": "pitta_kapha",
            "phenotype": "Pitta-Kapha (Dvandvaja)",
        },
        timeline=points,
        current_deviation_index=2.0,
        deviation_level=level,
        deviation_label=label,
        trend_summary="Pitta imbalance reduced by 94% over the 6-week intervention.",
        trend_direction="improving",
        total_checkins=6,
        latest_checkin_date=today.strftime("%Y-%m-%d"),
        is_demo_data=True,
    )


def _get_demo_history() -> VikritiHistoryResponse:
    today = datetime.utcnow()
    items = [
        VikritiHistoryItem(
            checkin_id=106,
            created_at=today,
            date_formatted=today.strftime("%d %b %Y"),
            vata_score=22.0,
            pitta_score=46.0,
            kapha_score=32.0,
            vata_delta=1.0,
            pitta_delta=0.0,
            kapha_delta=-1.0,
            most_aggravated="vata",
            deviation_index=2.0,
            clinical_milestone="Tridoshic Homeostasis Achieved",
            symptoms={
                "digestion": "Optimal Agni, clear digestion without acidity",
                "sleep": "Sound restorative sleep (7.5 hrs)",
                "mood": "Calm, focused, equanimous",
                "skin": "Lustrous, clear complexion",
            },
        ),
        VikritiHistoryItem(
            checkin_id=105,
            created_at=today - timedelta(days=7),
            date_formatted=(today - timedelta(days=7)).strftime("%d %b %Y"),
            vata_score=24.0,
            pitta_score=47.0,
            kapha_score=29.0,
            vata_delta=3.0,
            pitta_delta=1.0,
            kapha_delta=-4.0,
            most_aggravated="vata",
            deviation_index=8.0,
            clinical_milestone="Varsha Ritu transition; slight joint dryness",
            symptoms={
                "digestion": "Good appetite, mild post-meal gas",
                "sleep": "Good sleep, woke up at 6:00 AM",
                "mood": "Relaxed and motivated",
                "skin": "Slightly dry skin in rainy air",
            },
        ),
        VikritiHistoryItem(
            checkin_id=104,
            created_at=today - timedelta(days=14),
            date_formatted=(today - timedelta(days=14)).strftime("%d %b %Y"),
            vata_score=22.0,
            pitta_score=48.0,
            kapha_score=30.0,
            vata_delta=1.0,
            pitta_delta=2.0,
            kapha_delta=-3.0,
            most_aggravated="pitta",
            deviation_index=6.0,
            clinical_milestone="Complete acid remission; normalized Agni",
            symptoms={
                "digestion": "No heartburn, smooth digestion",
                "sleep": "Deep uninterrupted sleep",
                "mood": "Peaceful and content",
                "skin": "Clear skin, zero red flare-ups",
            },
        ),
        VikritiHistoryItem(
            checkin_id=103,
            created_at=today - timedelta(days=21),
            date_formatted=(today - timedelta(days=21)).strftime("%d %b %Y"),
            vata_score=23.0,
            pitta_score=52.0,
            kapha_score=25.0,
            vata_delta=2.0,
            pitta_delta=6.0,
            kapha_delta=-8.0,
            most_aggravated="pitta",
            deviation_index=16.0,
            clinical_milestone="Introduced Sheetali Pranayama & Pada Abhyanga",
            symptoms={
                "digestion": "Appetite sharp, no afternoon acid",
                "sleep": "7 hours, body temperature balanced",
                "mood": "Focused, patience improving",
                "skin": "Redness significantly reduced",
            },
        ),
        VikritiHistoryItem(
            checkin_id=102,
            created_at=today - timedelta(days=28),
            date_formatted=(today - timedelta(days=28)).strftime("%d %b %Y"),
            vata_score=22.0,
            pitta_score=58.0,
            kapha_score=20.0,
            vata_delta=1.0,
            pitta_delta=12.0,
            kapha_delta=-13.0,
            most_aggravated="pitta",
            deviation_index=26.0,
            clinical_milestone="Started Pitta-Shamak Diet (Bitter/Sweet/Astringent)",
            symptoms={
                "digestion": "Acid reflux frequency reduced by 50%",
                "sleep": "Still waking occasionally around 2 AM",
                "mood": "Moderately calmer, less irritation",
                "skin": "Breakouts healing, less heat",
            },
        ),
        VikritiHistoryItem(
            checkin_id=101,
            created_at=today - timedelta(days=35),
            date_formatted=(today - timedelta(days=35)).strftime("%d %b %Y"),
            vata_score=20.0,
            pitta_score=64.0,
            kapha_score=16.0,
            vata_delta=-1.0,
            pitta_delta=18.0,
            kapha_delta=-17.0,
            most_aggravated="pitta",
            deviation_index=36.0,
            clinical_milestone="Acute Pitta Spike (Heartburn & Irritability)",
            symptoms={
                "digestion": "Severe hyperacidity, burning after meals",
                "sleep": "Restless, waking thirsty at night",
                "mood": "Irritable, short temper, impatience",
                "skin": "Flushed face, acne breakout",
            },
        ),
    ]
    return VikritiHistoryResponse(
        items=items,
        total_count=len(items),
        is_demo_data=True,
    )


@router.get("/progression", response_model=VikritiProgressionResponse)
async def get_vikriti_progression(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Fetch longitudinal Vikriti progression timeline and deviation trajectory.
    If guest or fewer than 2 check-ins exist, returns the canonical 6-week case study demo.
    """
    cache_key = f"user:{current_user.id}:vikriti_progression"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return cached

    if current_user.role == "guest":
        demo_resp = _get_demo_progression()
        memory_cache.set(cache_key, demo_resp, ttl_seconds=300)
        return demo_resp

    # Query completed baseline Prakriti assessment
    prakriti_res = await session.exec(
        select(AssessmentSession)
        .where(
            AssessmentSession.user_id == current_user.id,
            AssessmentSession.status == "completed",
        )
        .order_by(AssessmentSession.started_at.desc())
    )
    prakriti_session = prakriti_res.first()

    base_v = prakriti_session.vata_score if prakriti_session and prakriti_session.vata_score is not None else 33.3
    base_p = prakriti_session.pitta_score if prakriti_session and prakriti_session.pitta_score is not None else 33.3
    base_k = prakriti_session.kapha_score if prakriti_session and prakriti_session.kapha_score is not None else 33.3
    base_type = prakriti_session.result_type if prakriti_session and prakriti_session.result_type else "prakriti"

    # Query all completed Vikriti check-ins
    query = (
        select(VikritiCheckin)
        .where(
            VikritiCheckin.user_id == current_user.id,
            VikritiCheckin.status == "completed",
        )
        .order_by(VikritiCheckin.created_at.asc())
    )
    result = await session.exec(query)
    checkins = result.all()

    if len(checkins) < 2:
        demo = _get_demo_progression()
        demo.baseline_prakriti = {
            "vata": round(base_v, 1),
            "pitta": round(base_p, 1),
            "kapha": round(base_k, 1),
            "result_type": base_type,
            "phenotype": base_type.replace("_", "-").title(),
        }
        return demo

    points = []
    for idx, c in enumerate(checkins):
        dev = round(abs(c.vata_delta) + abs(c.pitta_delta) + abs(c.kapha_delta), 1)
        points.append(
            VikritiProgressionPoint(
                checkin_id=c.id,
                date=c.created_at.strftime("%Y-%m-%d"),
                week_label=f"Week {idx + 1}",
                vata_score=round(c.vata_score, 1),
                pitta_score=round(c.pitta_score, 1),
                kapha_score=round(c.kapha_score, 1),
                vata_delta=round(c.vata_delta, 1),
                pitta_delta=round(c.pitta_delta, 1),
                kapha_delta=round(c.kapha_delta, 1),
                most_aggravated=c.most_aggravated,
                deviation_index=dev,
                clinical_milestone=None,
            )
        )

    last_dev = points[-1].deviation_index
    first_dev = points[0].deviation_index
    level, label = _classify_deviation(last_dev)

    if last_dev < first_dev:
        pct = round(((first_dev - last_dev) / max(first_dev, 1.0)) * 100)
        direction = "improving"
        summary = f"Tridoshic imbalance reduced by {pct}% across {len(checkins)} check-ins."
    elif last_dev > first_dev:
        pct = round(((last_dev - first_dev) / max(first_dev, 1.0)) * 100)
        direction = "elevated"
        summary = f"Imbalance elevated by {pct}%. Review seasonal Ahara and lifestyle guidelines."
    else:
        direction = "stable"
        summary = "Tridoshic constitutional equilibrium remains stable."

    prog_resp = VikritiProgressionResponse(
        baseline_prakriti={
            "vata": round(base_v, 1),
            "pitta": round(base_p, 1),
            "kapha": round(base_k, 1),
            "result_type": base_type,
            "phenotype": base_type.replace("_", "-").title(),
        },
        timeline=points,
        current_deviation_index=last_dev,
        deviation_level=level,
        deviation_label=label,
        trend_summary=summary,
        trend_direction=direction,
        total_checkins=len(checkins),
        latest_checkin_date=checkins[-1].created_at.strftime("%Y-%m-%d"),
        is_demo_data=False,
    )
    memory_cache.set(cache_key, prog_resp, ttl_seconds=300)
    return prog_resp


@router.get("/history", response_model=VikritiHistoryResponse)
async def get_vikriti_history(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve detailed history of past Vikriti check-ins.
    If guest or no check-ins exist, returns the canonical demo history.
    """
    cache_key = f"vikriti_history:{current_user.id}"
    cached_val = memory_cache.get(cache_key)
    if cached_val is not None:
        return cached_val

    if current_user.role == "guest":
        demo_hist = _get_demo_history()
        memory_cache.set(cache_key, demo_hist, ttl_seconds=300)
        return demo_hist

    query = (
        select(VikritiCheckin)
        .where(
            VikritiCheckin.user_id == current_user.id,
            VikritiCheckin.status == "completed",
        )
        .order_by(VikritiCheckin.created_at.desc())
    )
    result = await session.exec(query)
    checkins = result.all()

    if not checkins:
        demo_hist = _get_demo_history()
        memory_cache.set(cache_key, demo_hist, ttl_seconds=300)
        return demo_hist

    items = []
    for c in checkins:
        dev = round(abs(c.vata_delta) + abs(c.pitta_delta) + abs(c.kapha_delta), 1)
        items.append(
            VikritiHistoryItem(
                checkin_id=c.id,
                created_at=c.created_at,
                date_formatted=c.created_at.strftime("%d %b %Y"),
                vata_score=round(c.vata_score, 1),
                pitta_score=round(c.pitta_score, 1),
                kapha_score=round(c.kapha_score, 1),
                vata_delta=round(c.vata_delta, 1),
                pitta_delta=round(c.pitta_delta, 1),
                kapha_delta=round(c.kapha_delta, 1),
                most_aggravated=c.most_aggravated,
                deviation_index=dev,
                symptoms=None,
                clinical_milestone=None,
            )
        )

    hist_resp = VikritiHistoryResponse(
        items=items,
        total_count=len(items),
        is_demo_data=False,
    )
    memory_cache.set(cache_key, hist_resp, ttl_seconds=300)
    return hist_resp

