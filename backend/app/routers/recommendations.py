"""Recommendations API router — serves personalized Dinacharya & Lifestyle guidance.

Follows the 3-layer clinical model:
1. Prakriti Baseline (genetic constitution)
2. Current Season (Ritucharya overlay)
3. Weekly Dynamic Vikriti (recent aggravation adjustments)
"""

from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.cache import memory_cache
from app.core.deps import get_current_user
from app.data.dinacharya_content import get_lifestyle_recommendations
from app.db.session import get_session
from app.models import AssessmentSession, User, VikritiCheckin
from app.schemas import LifestyleRecommendationResponse
from app.services.ritucharya import get_current_ritu

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/lifestyle", response_model=LifestyleRecommendationResponse)
async def get_lifestyle_recommendations_endpoint(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return personalized Dinacharya (daily routine), Sleep, Exercise,
    and Pranayama recommendations tailored to Prakriti, current Ritu, and
    active weekly Vikriti."""
    cache_key = f"user:{current_user.id}:lifestyle"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return cached

    # 1. Fetch user's latest completed Prakriti assessment
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
                "Complete your Prakriti assessment first to get personalized lifestyle recommendations.",
            )
    else:
        dosha_result = assessment.result_type or "pitta_kapha"

    # 2. Detect active season
    ritu = get_current_ritu(date.today())

    # 3. Fetch latest completed Vikriti check-in (weekly layer)
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

    latest_vikriti: Optional[dict] = None
    if latest_checkin:
        now = datetime.utcnow()
        days_ago = (now - latest_checkin.created_at).days
        is_stale = days_ago > 10

        latest_vikriti = {
            "most_aggravated": latest_checkin.most_aggravated,
            "days_ago": days_ago,
            "is_stale": is_stale,
            "vata_delta": latest_checkin.vata_delta,
            "pitta_delta": latest_checkin.pitta_delta,
            "kapha_delta": latest_checkin.kapha_delta,
        }

    # 4. Generate lifestyle plan
    plan = get_lifestyle_recommendations(
        dosha_result=dosha_result,
        ritu=ritu,
        latest_vikriti=latest_vikriti,
    )

    memory_cache.set(cache_key, plan, ttl_seconds=300)
    return plan
