from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models import User


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    session: AsyncSession = Depends(get_session),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")

    payload = decode_access_token(authorization.removeprefix("Bearer "))
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    if payload.get("role") == "guest" or str(payload.get("sub", "")).startswith("guest"):
        return User(
            id=0,
            name="Guest Evaluator",
            email="guest@ayushya.org",
            role="guest",
            is_active=True,
            preferred_language="en",
            date_of_birth=None,
            gender=None,
            avatar_type="icon",
            avatar_value="leaf:#2A4638",
            notifications_enabled=True,
        )


    user = await session.get(User, int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive")
    return user

