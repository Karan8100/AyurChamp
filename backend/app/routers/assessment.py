import logging
from datetime import datetime
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.cache import memory_cache
from app.core.deps import get_current_user
from app.data.prakriti_questions import (
    PHASE1_QUESTIONS,
    QUESTION_BANK_VERSION,
    TIE_BREAKER_BANKS,
    find_question,
)
from app.db.session import get_session
from app.models import AssessmentSession, QuestionResponse, User
from app.schemas import (
    AnswerSubmission,
    AssessmentAnswerOut,
    AssessmentHistoryItem,
    AssessmentHistoryResponse,
    AssessmentResultOut,
    AssessmentStartOut,
    OptionOut,
    QuestionOut,
)
from app.services.prakriti_scoring import decide_next_step

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assessment", tags=["assessment"])


def _serialize_question(q: dict, phase: int) -> QuestionOut:
    return QuestionOut(
        id=q["id"],
        phase=phase,
        domain=q.get("domain"),
        source_note=q.get("source_note"),
        text=q["text"],
        image=q.get("image") or q.get("image_key"),
        options=[OptionOut(**opt) for opt in q["options"]],
    )



async def _dosha_counts(session: AsyncSession, session_id: int):
    result = await session.exec(
        select(QuestionResponse).where(QuestionResponse.session_id == session_id)
    )
    responses = result.all()
    counts = {"vata": 0, "pitta": 0, "kapha": 0}
    phase1_ids, phase2_ids = set(), set()
    for r in responses:
        counts[r.selected_dosha] += 1
        (phase1_ids if r.phase == 1 else phase2_ids).add(r.question_id)
    return counts, phase1_ids, phase2_ids


@router.post("/start", response_model=AssessmentStartOut)
async def start_assessment(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    session_id = None
    try:
        assessment = AssessmentSession(user_id=current_user.id, question_bank_version=QUESTION_BANK_VERSION)
        session.add(assessment)
        await session.commit()
        await session.refresh(assessment)
        session_id = assessment.id
    except Exception as e:
        await session.rollback()
        logger.warning(f"Initial AssessmentSession insert failed: {e}")
        if current_user.role == "guest":
            try:
                g = await session.get(User, 0)
                if not g:
                    session.add(User(id=0, name="Guest Evaluator", email="guest@ayushya.org", role="guest", is_active=True))
                    await session.commit()
                assessment = AssessmentSession(user_id=0, question_bank_version=QUESTION_BANK_VERSION)
                session.add(assessment)
                await session.commit()
                await session.refresh(assessment)
                session_id = assessment.id
            except Exception as e2:
                await session.rollback()
                logger.error(f"Fallback guest session creation failed: {e2}")
                session_id = int(datetime.utcnow().timestamp())
        else:
            raise HTTPException(500, f"Failed to start assessment: {str(e)}")

    phase1_all = [_serialize_question(q, phase=1) for q in PHASE1_QUESTIONS]
    return AssessmentStartOut(
        session_id=session_id or 1,
        question=phase1_all[0],
        all_questions=phase1_all,
        total_questions=len(phase1_all),
    )


@router.post("/{session_id}/answer", response_model=AssessmentAnswerOut)
async def submit_answer(
    session_id: int,
    payload: AnswerSubmission,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    assessment = await session.get(AssessmentSession, session_id)
    if not assessment or assessment.user_id != current_user.id:
        raise HTTPException(404, "Assessment session not found")
    if assessment.status == "completed":
        return AssessmentAnswerOut(
            session_id=session_id,
            status="completed",
            result=AssessmentResultOut(
                result_type=assessment.result_type or "prakriti",
                vata_score=assessment.vata_score or 0.0,
                pitta_score=assessment.pitta_score or 0.0,
                kapha_score=assessment.kapha_score or 0.0,
                phase_reached=assessment.phase_reached or 1,
                total_questions=24,
            ),
        )

    question = find_question(payload.question_id)
    if not question:
        raise HTTPException(400, "Unknown question_id")
    if payload.selected_dosha not in ("vata", "pitta", "kapha"):
        raise HTTPException(400, "Invalid selected_dosha")

    # Check if question was already answered in this session (allow updating)
    existing_res = await session.exec(
        select(QuestionResponse).where(
            QuestionResponse.session_id == session_id,
            QuestionResponse.question_id == payload.question_id,
        )
    )
    existing_resp = existing_res.first()
    if existing_resp:
        existing_resp.selected_dosha = payload.selected_dosha
        session.add(existing_resp)
        response = existing_resp
    else:
        response = QuestionResponse(
            session_id=session_id,
            question_id=payload.question_id,
            phase=assessment.phase_reached,
            domain=question.get("domain"),
            selected_dosha=payload.selected_dosha,
        )
        session.add(response)
    await session.flush()

    counts, phase1_ids, phase2_ids = await _dosha_counts(session, session_id)
    decision = decide_next_step(
        phase_reached=assessment.phase_reached,
        tie_break_pair=assessment.tie_break_pair,
        dosha_counts=counts,
        answered_phase1_ids=phase1_ids,
        answered_phase2_ids=phase2_ids,
    )

    if decision["action"] == "finish":
        scores = decision["scores"]
        assessment.status = "completed"
        assessment.vata_score = scores["vata"]
        assessment.pitta_score = scores["pitta"]
        assessment.kapha_score = scores["kapha"]
        assessment.result_type = decision["result_type"]
        assessment.result_summary = json.dumps(
            {
                "scores": scores,
                "result_type": decision["result_type"],
                "phase_reached": assessment.phase_reached,
                "tie_break_pair": assessment.tie_break_pair,
            }
        )
        assessment.completed_at = response.answered_at
        session.add(assessment)
        await session.commit()
        memory_cache.clear_for_user(current_user.id)

        return AssessmentAnswerOut(
            session_id=session_id,
            status="completed",
            result=AssessmentResultOut(
                result_type=assessment.result_type,
                vata_score=assessment.vata_score,
                pitta_score=assessment.pitta_score,
                kapha_score=assessment.kapha_score,
                phase_reached=assessment.phase_reached,
                total_questions=len(phase1_ids) + len(phase2_ids),
            ),
        )

    assessment.phase_reached = decision["phase"]
    if decision["tie_break_pair"]:
        assessment.tie_break_pair = decision["tie_break_pair"]
    session.add(assessment)
    await session.commit()

    phase2_all = None
    if decision.get("phase") == 2 and decision.get("tie_break_pair") in TIE_BREAKER_BANKS:
        phase2_all = [_serialize_question(q, phase=2) for q in TIE_BREAKER_BANKS[decision["tie_break_pair"]]]

    return AssessmentAnswerOut(
        session_id=session_id,
        status="in_progress",
        next_question=_serialize_question(decision["question"], phase=decision["phase"]),
        all_phase2_questions=phase2_all,
    )


@router.get("/result", response_model=AssessmentResultOut)
async def get_latest_result(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(
        select(AssessmentSession)
        .where(
            AssessmentSession.user_id == current_user.id,
            AssessmentSession.status == "completed",
        )
        .order_by(AssessmentSession.started_at.desc())
    )
    assessment = result.first()
    if not assessment:
        raise HTTPException(404, "No completed assessment found")

    _, phase1_ids, phase2_ids = await _dosha_counts(session, assessment.id)
    return AssessmentResultOut(
        result_type=assessment.result_type,
        vata_score=assessment.vata_score,
        pitta_score=assessment.pitta_score,
        kapha_score=assessment.kapha_score,
        phase_reached=assessment.phase_reached,
        total_questions=len(phase1_ids) + len(phase2_ids),
    )


@router.get("/{session_id}/result", response_model=AssessmentResultOut)
async def get_result(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    assessment = await session.get(AssessmentSession, session_id)
    if not assessment or assessment.user_id != current_user.id:
        raise HTTPException(404, "Assessment session not found")
    if assessment.status != "completed":
        raise HTTPException(400, "Assessment not completed yet")

    _, phase1_ids, phase2_ids = await _dosha_counts(session, session_id)
    return AssessmentResultOut(
        result_type=assessment.result_type,
        vata_score=assessment.vata_score,
        pitta_score=assessment.pitta_score,
        kapha_score=assessment.kapha_score,
        phase_reached=assessment.phase_reached,
        total_questions=len(phase1_ids) + len(phase2_ids),
    )


@router.get("/history", response_model=AssessmentHistoryResponse)
async def get_assessment_history(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve the user's historical Prakriti diagnostic sessions.
    If guest or no completed sessions exist, returns the canonical demo baseline assessment.
    """
    if current_user.role == "guest":
        return AssessmentHistoryResponse(
            items=[
                AssessmentHistoryItem(
                    session_id=1,
                    completed_at=datetime.utcnow(),
                    started_at=datetime.utcnow(),
                    result_type="pitta_kapha",
                    vata_score=21.0,
                    pitta_score=46.0,
                    kapha_score=33.0,
                    phase_reached=1,
                    total_questions=24,
                )
            ],
            total_count=1,
            is_demo_data=True,
        )

    result = await session.exec(
        select(AssessmentSession)
        .where(
            AssessmentSession.user_id == current_user.id,
            AssessmentSession.status == "completed",
        )
        .order_by(AssessmentSession.started_at.desc())
    )
    sessions = result.all()

    if not sessions:
        return AssessmentHistoryResponse(
            items=[],
            total_count=0,
            is_demo_data=False,
        )

    items = []
    for s in sessions:
        _, phase1_ids, phase2_ids = await _dosha_counts(session, s.id)
        items.append(
            AssessmentHistoryItem(
                session_id=s.id,
                completed_at=s.completed_at or s.started_at,
                started_at=s.started_at,
                result_type=s.result_type or "prakriti",
                vata_score=round(s.vata_score or 0.0, 1),
                pitta_score=round(s.pitta_score or 0.0, 1),
                kapha_score=round(s.kapha_score or 0.0, 1),
                phase_reached=s.phase_reached or 1,
                total_questions=len(phase1_ids) + len(phase2_ids),
            )
        )

    return AssessmentHistoryResponse(
        items=items,
        total_count=len(items),
        is_demo_data=False,
    )
