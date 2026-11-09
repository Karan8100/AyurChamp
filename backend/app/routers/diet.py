"""Diet Plan API — serves personalized Ayurvedic diet guidance.

Separates "gather context" (fetch user's dosha + current Ritu) from
"generate content" (generate_diet_plan). Only the generator changes
when RAG is integrated later.
"""

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.cache import memory_cache
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models import AssessmentSession, User, VikritiCheckin
from app.schemas import DietPlanResponse
from app.services.diet_plan import generate_diet_plan
from app.services.ritucharya import get_current_ritu

router = APIRouter(tags=["diet"])


@router.get("/diet-plan", response_model=DietPlanResponse)
async def get_diet_plan(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return a personalized diet plan based on the user's Prakriti
    result, current Ayurvedic season (Ritu), and weekly Vikriti check-in."""
    cache_key = f"user:{current_user.id}:diet_plan"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return cached

    # 1. Fetch the user's latest completed Prakriti assessment
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
        if current_user.role == "guest":
            dosha_result = "pitta_kapha"
        else:
            raise HTTPException(
                404,
                "Complete your Prakriti assessment first to get personalized diet recommendations.",
            )
    else:
        dosha_result = assessment.result_type or "pitta_kapha"

    # 2. Detect the current Ritu (season)
    ritu = get_current_ritu(date.today())

    # 3. Fetch latest completed Vikriti check-in (Step 2 weekly dynamic layer)
    vikriti_query = (
        select(VikritiCheckin)
        .where(
            VikritiCheckin.user_id == current_user.id,
            VikritiCheckin.status == "completed",
        )
        .order_by(VikritiCheckin.created_at.desc())
    )
    vikriti_res = await session.exec(vikriti_query)
    latest_checkin = vikriti_res.first()

    latest_vikriti_dict = None
    has_recent_vikriti = False
    is_stale_vikriti = False

    if latest_checkin:
        days_ago = (datetime.utcnow() - latest_checkin.created_at).days
        is_stale_vikriti = days_ago > 10
        has_recent_vikriti = not is_stale_vikriti
        latest_vikriti_dict = {
            "most_aggravated": latest_checkin.most_aggravated,
            "days_ago": days_ago,
            "created_at": latest_checkin.created_at,
            "vata_delta": latest_checkin.vata_delta,
            "pitta_delta": latest_checkin.pitta_delta,
            "kapha_delta": latest_checkin.kapha_delta,
            "is_stale": is_stale_vikriti,
        }

    # 4. Generate the diet plan (static lookup now, RAG swap later)
    plan = generate_diet_plan(
        dosha_result=dosha_result,
        ritu=ritu,
        latest_vikriti=latest_vikriti_dict,
    )


    plan["has_vikriti"] = has_recent_vikriti
    plan["vikriti_stale"] = is_stale_vikriti
    memory_cache.set(cache_key, plan, ttl_seconds=300)
    return plan

