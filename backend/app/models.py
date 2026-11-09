from datetime import datetime
from typing import List, Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime
from sqlmodel import Column, Field, SQLModel


class User(SQLModel, table=True):
    """Auth-linked profile. PII lives here, kept separate from any future
    health/assessment data (added in Phase 1) so the two can be governed
    and deleted independently.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = None
    email: Optional[str] = Field(default=None, unique=True, index=True)
    phone: Optional[str] = Field(default=None, unique=True, index=True)
    password_hash: Optional[str] = None  # set only for email+password signups
    google_id: Optional[str] = Field(default=None, unique=True, index=True)
    auth_provider: str = "email"  # "email" | "phone" | "google"
    email_verified: bool = False
    phone_verified: bool = False
    preferred_language: str = "en"
    role: str = "user"  # "user" | "practitioner" | "admin"
    consent_given_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=False))
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_type=DateTime(timezone=False))
    last_login_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=False))

    # Demographics & Avatar (Profile redesign)
    date_of_birth: Optional[str] = None  # YYYY-MM-DD
    gender: Optional[str] = None  # "male" | "female" | "other" | "prefer_not_to_say"
    avatar_type: Optional[str] = "icon"  # "photo" | "icon" | "none"
    avatar_value: Optional[str] = "leaf:#2A4638"  # URL string or "icon_name:color"
    notifications_enabled: bool = True


class OTPVerification(SQLModel, table=True):
    """Short-lived OTP records, kept separate from User since a phone/email
    may be verified before any User row exists for it (first-time signup).
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    identifier: str = Field(index=True)  # phone or email the OTP was sent to
    code_hash: str
    purpose: str = "login"  # "login" | "signup" | "verify_phone" | "verify_email"
    expires_at: datetime = Field(sa_type=DateTime(timezone=False))
    verified: bool = False
    attempts: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_type=DateTime(timezone=False))


class AssessmentSession(SQLModel, table=True):
    """One Prakriti assessment attempt. Static question/option content
    lives in app/data/prakriti_questions.py (versioned via
    `question_bank_version`) — only the user's dynamic answers and derived
    result are persisted here, kept separate from User for independent
    health-data governance/deletion.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    question_bank_version: str = "v1"
    status: str = "in_progress"  # "in_progress" | "completed"
    phase_reached: int = 1  # 1 or 2
    tie_break_pair: Optional[str] = None  # "vata_pitta" | "pitta_kapha" | "vata_kapha"
    vata_score: Optional[float] = None
    pitta_score: Optional[float] = None
    kapha_score: Optional[float] = None
    result_type: Optional[str] = None
    result_summary: Optional[str] = None  # compact JSON, used as LLM context
    started_at: datetime = Field(default_factory=datetime.utcnow, sa_type=DateTime(timezone=False))
    completed_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=False))


class QuestionResponse(SQLModel, table=True):
    """Single answer within an AssessmentSession. `question_id` refers to
    an id in the static question bank, not a DB row.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="assessmentsession.id", index=True)
    question_id: str
    phase: int
    domain: Optional[str] = None
    selected_dosha: str
    answered_at: datetime = Field(default_factory=datetime.utcnow, sa_type=DateTime(timezone=False))


class KnowledgeChunk(SQLModel, table=True):
    """Ayurvedic knowledge chunk with pgvector embedding for RAG retrieval."""

    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    source: str  # e.g. "diet_guide_vata", "ritucharya_grishma"
    category: str  # "diet" | "lifestyle" | "herb" | "general"
    embedding: List[float] = Field(sa_column=Column(Vector(1536)))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_type=DateTime(timezone=False))


class VikritiCheckin(SQLModel, table=True):
    """Weekly Vikriti check-in. Tracks transient dosha imbalances over time."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    vata_score: float = 0.0
    pitta_score: float = 0.0
    kapha_score: float = 0.0
    vata_delta: float = 0.0  # from compute_aggravation() vs baseline Prakriti
    pitta_delta: float = 0.0
    kapha_delta: float = 0.0
    most_aggravated: str = "vata"  # "vata" | "pitta" | "kapha"
    status: str = "in_progress"  # "in_progress" | "completed"
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_type=DateTime(timezone=False))


class VikritiResponse(SQLModel, table=True):
    """Individual answer recorded during a Vikriti check-in."""

    id: Optional[int] = Field(default=None, primary_key=True)
    checkin_id: int = Field(foreign_key="vikriticheckin.id", index=True)
    question_id: str
    selected_dosha: str
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_type=DateTime(timezone=False))
