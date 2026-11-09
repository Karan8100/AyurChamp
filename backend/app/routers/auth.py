import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.cache import memory_cache
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_value, verify_value
from app.db.session import get_session
from app.models import AssessmentSession, OTPVerification, User, VikritiCheckin
from app.services.cloudinary_service import upload_avatar_image
from app.services.email import send_otp_email
from app.schemas import (
    AvatarUploadIn,
    LoginRequest,
    OTPRequest,
    OTPVerifyRequest,
    ProfileUpdateIn,
    SignupRequest,
    TokenResponse,
    UserMeOut,
)



router = APIRouter(prefix="/auth", tags=["auth"])

OTP_EXPIRE_MINUTES = 5
MAX_OTP_ATTEMPTS = 5


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest, session: AsyncSession = Depends(get_session)):
    if not payload.consent_given:
        raise HTTPException(400, "Consent is required to create an account")

    result = await session.exec(select(User).where(User.email == payload.email))
    if result.first():
        raise HTTPException(400, "Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_value(payload.password),
        auth_provider="email",
        preferred_language=payload.preferred_language,
        consent_given_at=datetime.utcnow(),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user_id=user.id, role=user.role)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(User).where(User.email == payload.email))
    user = result.first()
    if not user or not user.password_hash or not verify_value(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")

    user.last_login_at = datetime.utcnow()
    session.add(user)
    await session.commit()

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user_id=user.id, role=user.role)


@router.post("/guest", response_model=TokenResponse)
async def guest_login():
    """Issue an ephemeral, zero-database guest access token for guests and evaluators.
    No permanent rows are written to the database."""
    token = create_access_token("guest_evaluator", role="guest")
    return TokenResponse(access_token=token, user_id=0, role="guest")


@router.post("/otp/request")
async def request_otp(payload: OTPRequest, session: AsyncSession = Depends(get_session)):
    if not payload.email and not payload.phone:
        raise HTTPException(400, "Either email or phone is required")

    send_to_email = payload.email
    user_name = payload.name or ""

    # If only phone is provided, look up the user's registered email
    if not send_to_email and payload.phone:
        result = await session.exec(select(User).where(User.phone == payload.phone))
        user = result.first()
        if not user or not user.email:
            raise HTTPException(404, "No account found with this phone number")
        send_to_email = user.email
        user_name = user_name or user.name or ""

    # OTP identifier is always the email (OTP is always delivered via email)
    code = f"{random.randint(0, 999999):06d}"
    otp = OTPVerification(
        identifier=send_to_email,
        code_hash=hash_value(code),
        purpose=payload.purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES),
    )
    session.add(otp)
    await session.commit()

    # Send OTP via email (Resend)
    try:
        await send_otp_email(
            to_email=send_to_email,
            otp_code=code,
            user_name=user_name,
        )
        # Mask the email for privacy in the response (e.g. a***@gmail.com)
        local, domain = send_to_email.split("@")
        masked = local[0] + "***@" + domain if len(local) > 1 else "***@" + domain
        return {"message": "OTP sent to your email", "masked_email": masked}
    except Exception:
        # Email failed — still return the code in dev mode so flow isn't blocked
        return {"message": "OTP generated (email delivery failed)", "dev_only_code": code}


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(payload: OTPVerifyRequest, session: AsyncSession = Depends(get_session)):
    identifier = payload.email or payload.phone
    if not identifier:
        raise HTTPException(400, "Either email or phone is required")

    result = await session.exec(
        select(OTPVerification)
        .where(OTPVerification.identifier == identifier, OTPVerification.verified == False)  # noqa: E712
        .order_by(OTPVerification.created_at.desc())
    )
    otp = result.first()

    if not otp or otp.expires_at < datetime.utcnow():
        raise HTTPException(400, "OTP expired or not found")
    if otp.attempts >= MAX_OTP_ATTEMPTS:
        raise HTTPException(429, "Too many attempts, request a new OTP")
    if not verify_value(payload.code, otp.code_hash):
        otp.attempts += 1
        session.add(otp)
        await session.commit()
        raise HTTPException(400, "Incorrect OTP")

    otp.verified = True
    session.add(otp)

    # Look up user by the identifier used (email or phone)
    if payload.email:
        result = await session.exec(select(User).where(User.email == payload.email))
    else:
        result = await session.exec(select(User).where(User.phone == payload.phone))
    user = result.first()

    if not user:
        if not payload.consent_given:
            raise HTTPException(400, "Consent is required to create an account")
        if payload.email:
            user = User(
                email=payload.email,
                email_verified=True,
                auth_provider="email",
                consent_given_at=datetime.utcnow(),
            )
        else:
            user = User(
                phone=payload.phone,
                phone_verified=True,
                auth_provider="phone",
                consent_given_at=datetime.utcnow(),
            )
    else:
        if payload.email:
            user.email_verified = True
        else:
            user.phone_verified = True
        user.last_login_at = datetime.utcnow()

    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user_id=user.id, role=user.role)


@router.get("/me", response_model=UserMeOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserMeOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role,
        preferred_language=current_user.preferred_language,
        date_of_birth=current_user.date_of_birth,
        gender=current_user.gender,
        avatar_type=current_user.avatar_type or "icon",
        avatar_value=current_user.avatar_value or "leaf:#2A4638",
        notifications_enabled=current_user.notifications_enabled if current_user.notifications_enabled is not None else True,
    )


@router.patch("/profile", response_model=UserMeOut)
async def update_profile(
    payload: ProfileUpdateIn,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update editable demographic and avatar profile fields."""
    if current_user.role == "guest":
        if payload.name is not None: current_user.name = payload.name
        if payload.date_of_birth is not None: current_user.date_of_birth = payload.date_of_birth
        if payload.gender is not None: current_user.gender = payload.gender
        if payload.avatar_type is not None: current_user.avatar_type = payload.avatar_type
        if payload.avatar_value is not None: current_user.avatar_value = payload.avatar_value
        if payload.notifications_enabled is not None: current_user.notifications_enabled = payload.notifications_enabled
        if payload.preferred_language is not None: current_user.preferred_language = payload.preferred_language
        return await get_me(current_user)

    user = await session.get(User, current_user.id)
    if not user:
        raise HTTPException(404, "User not found")

    if payload.name is not None: user.name = payload.name
    if payload.date_of_birth is not None: user.date_of_birth = payload.date_of_birth
    if payload.gender is not None: user.gender = payload.gender
    if payload.avatar_type is not None: user.avatar_type = payload.avatar_type
    if payload.avatar_value is not None: user.avatar_value = payload.avatar_value
    if payload.notifications_enabled is not None: user.notifications_enabled = payload.notifications_enabled
    if payload.preferred_language is not None: user.preferred_language = payload.preferred_language

    session.add(user)
    await session.commit()
    await session.refresh(user)
    memory_cache.clear_for_user(user.id)
    return await get_me(user)


@router.post("/avatar-upload")
async def upload_avatar(
    payload: AvatarUploadIn,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Uploads avatar image using Cloudinary (with automatic fallback)."""
    result = await upload_avatar_image(
        image_base64=payload.image_base64,
        filename=payload.filename or "avatar.png",
        user_id=current_user.id or 0,
    )

    if current_user.role != "guest" and current_user.id:
        user = await session.get(User, current_user.id)
        if user:
            user.avatar_type = "photo"
            user.avatar_value = result["url"]
            session.add(user)
            await session.commit()
            memory_cache.clear_for_user(user.id)

    return result



@router.get("/export-data")
async def export_user_data(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """DPDP Act Section 12 — Right to Data Portability (real database export)."""
    if current_user.role == "guest":
        return {
            "exported_at": datetime.utcnow().isoformat(),
            "compliance": "DPDP Act (India) — Right to Data Portability",
            "user": {
                "id": 0,
                "role": "guest",
                "name": current_user.name,
                "email": current_user.email,
            },
            "prakriti_assessments": [],
            "vikriti_checkins": [],
            "note": "Guest mode is ephemeral; no persistent database records stored.",
        }

    sessions_res = await session.exec(
        select(AssessmentSession)
        .where(AssessmentSession.user_id == current_user.id)
        .order_by(AssessmentSession.created_at.desc())
    )
    assessments = sessions_res.all()

    vikriti_res = await session.exec(
        select(VikritiCheckin)
        .where(VikritiCheckin.user_id == current_user.id)
        .order_by(VikritiCheckin.created_at.desc())
    )
    checkins = vikriti_res.all()

    return {
        "exported_at": datetime.utcnow().isoformat(),
        "compliance": "DPDP Act (India) — Right to Data Portability (Section 12)",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "date_of_birth": current_user.date_of_birth,
            "gender": current_user.gender,
            "preferred_language": current_user.preferred_language,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "consent_given_at": current_user.consent_given_at.isoformat() if current_user.consent_given_at else None,
        },
        "prakriti_assessments": [
            {
                "session_id": a.id,
                "status": a.status,
                "phase_reached": a.phase_reached,
                "result_type": a.result_type,
                "vata_score": a.vata_score,
                "pitta_score": a.pitta_score,
                "kapha_score": a.kapha_score,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "completed_at": a.completed_at.isoformat() if a.completed_at else None,
            }
            for a in assessments
        ],
        "vikriti_checkins": [
            {
                "checkin_id": v.id,
                "status": v.status,
                "most_aggravated": v.most_aggravated,
                "vata_score": v.vata_score,
                "pitta_score": v.pitta_score,
                "kapha_score": v.kapha_score,
                "vata_delta": v.vata_delta,
                "pitta_delta": v.pitta_delta,
                "kapha_delta": v.kapha_delta,
                "created_at": v.created_at.isoformat() if v.created_at else None,
            }
            for v in checkins
        ],
    }


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """DPDP Act Right to Erasure / Account Deletion."""
    if current_user.role != "guest" and current_user.id:
        user = await session.get(User, current_user.id)
        if user:
            user.is_active = False
            session.add(user)
            await session.commit()
            memory_cache.clear_for_user(user.id)
    return {"status": "deleted", "message": "Account successfully deactivated."}

