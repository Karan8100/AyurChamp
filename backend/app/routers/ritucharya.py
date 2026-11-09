"""Ritucharya API router — serves classical seasonal calendar and guidance.

Provides structured data for all six classical seasons (Shad Ritu)
alongside gentle, non-medicalized personal constitution alignment.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Header
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.cache import memory_cache
from app.core.security import decode_access_token
from app.data.ritucharya_content import get_all_seasons_data, get_season_by_id
from app.db.session import get_session
from app.models import AssessmentSession, User
from app.schemas import (
    RitucharyaResponse,
    SeasonDetail,
    UserSeasonFocus,
)
from app.services.ritucharya import get_current_ritu

router = APIRouter(prefix="/ritucharya", tags=["ritucharya"])


async def get_optional_user(
    authorization: Optional[str] = Header(default=None),
    session: AsyncSession = Depends(get_session),
) -> Optional[User]:
    """Gracefully resolve user if valid Bearer token provided, else None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ")
    payload = decode_access_token(token)
    if not payload:
        return None
    try:
        user = await session.get(User, int(payload["sub"]))
        if user and user.is_active:
            return user
    except Exception:
        return None
    return None


@router.get("/details", response_model=RitucharyaResponse)
async def get_ritucharya_details(
    user: Optional[User] = Depends(get_optional_user),
    session: AsyncSession = Depends(get_session),
):
    """Return all 6 classical seasons with the active season identified,
    plus an optional personalized focus note if the user has an assessment."""
    user_key = user.id if user else "anon"
    cache_key = f"user:{user_key}:ritucharya"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return cached

    # 1. Determine active season from classical calendar
    current_ritu_info = get_current_ritu()
    current_season_id = current_ritu_info.get("ritu", "varsha")

    # 2. Load all 6 seasons
    seasons_raw = get_all_seasons_data()
    seasons = [SeasonDetail(**s) for s in seasons_raw]

    # 3. Check personalized focus if user is authenticated
    user_focus: Optional[UserSeasonFocus] = None
    if user:
        result = await session.exec(
            select(AssessmentSession)
            .where(
                AssessmentSession.user_id == user.id,
                AssessmentSession.status == "completed",
            )
            .order_by(AssessmentSession.started_at.desc())
        )
        assessment = result.first()
        if assessment and assessment.result_type:
            dosha_raw = assessment.result_type
            primary_dosha = dosha_raw.split("_")[0] if "_" in dosha_raw else dosha_raw
            if primary_dosha == "tridoshic":
                primary_dosha = "vata"

            display_dosha = primary_dosha.capitalize()
            current_season = get_season_by_id(current_season_id)
            season_prakopa = current_season["dosha_dynamics"].get("prakopa")

            is_aggravated = bool(
                season_prakopa and season_prakopa.lower() == primary_dosha.lower()
            )

            if is_aggravated:
                note = (
                    f"{current_season['sanskrit_name']} tends to aggravate {season_prakopa}, "
                    f"which is your dominant dosha ({display_dosha}) — worth paying extra "
                    f"attention to this season's warm diet and gentle daily routine."
                )
            else:
                note = (
                    f"Your dominant constitution is {display_dosha}. While "
                    f"{current_season['sanskrit_name']} naturally influences {season_prakopa or 'the environment'}, "
                    f"maintaining regular mealtimes and seasonal hydration will keep you grounded."
                )

            user_focus = UserSeasonFocus(
                is_dominant_aggravated=is_aggravated,
                dominant_dosha=display_dosha,
                note=note,
            )

    resp = RitucharyaResponse(
        current_season_id=current_season_id,
        seasons=seasons,
        user_focus=user_focus,
    )
    memory_cache.set(cache_key, resp, ttl_seconds=300)
    return resp


@router.get("/all")
async def get_all_seasons():
    """Public lookup for all 6 classical season profiles."""
    return {
        "current_season_id": get_current_ritu().get("ritu", "varsha"),
        "seasons": get_all_seasons_data(),
    }
