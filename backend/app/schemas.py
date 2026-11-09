from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=8, max_length=72)
    preferred_language: str = "en"
    consent_given: bool


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class OTPRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None  # when provided, OTP is sent via email (Resend)
    name: Optional[str] = None  # used for personalizing the email template
    purpose: str = "login"  # "login" | "signup"


class OTPVerifyRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    code: str
    consent_given: bool = False  # required only if this creates a new account


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str


class UserMeOut(BaseModel):
    id: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    preferred_language: str = "en"
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    avatar_type: Optional[str] = "icon"
    avatar_value: Optional[str] = "leaf:#2A4638"
    notifications_enabled: bool = True


class ProfileUpdateIn(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    avatar_type: Optional[str] = None
    avatar_value: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    preferred_language: Optional[str] = None


class AvatarUploadIn(BaseModel):
    image_base64: str
    filename: Optional[str] = "avatar.png"




class OptionOut(BaseModel):
    dosha: str
    text: str
    image_key: Optional[str] = None
    display_label: Optional[str] = None  # short neutral caption shown in UI instead of the dosha name


class QuestionOut(BaseModel):
    id: str
    phase: int
    domain: Optional[str] = None
    source_note: Optional[str] = None
    text: str
    image: Optional[str] = None
    options: List[OptionOut]


class AssessmentStartOut(BaseModel):
    session_id: int
    question: QuestionOut
    all_questions: Optional[List[QuestionOut]] = None
    total_questions: int = 24


class AnswerSubmission(BaseModel):
    question_id: str
    selected_dosha: str


class AssessmentResultOut(BaseModel):
    result_type: str
    vata_score: float
    pitta_score: float
    kapha_score: float
    phase_reached: int
    total_questions: int


class AssessmentAnswerOut(BaseModel):
    session_id: int
    status: str
    next_question: Optional[QuestionOut] = None
    all_phase2_questions: Optional[List[QuestionOut]] = None
    result: Optional[AssessmentResultOut] = None


class AssessmentHistoryItem(BaseModel):
    session_id: int
    completed_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    result_type: str
    vata_score: float
    pitta_score: float
    kapha_score: float
    phase_reached: int
    total_questions: int


class AssessmentHistoryResponse(BaseModel):
    items: List[AssessmentHistoryItem]
    total_count: int
    is_demo_data: bool = False


# ── Diet Plan Schemas ──────────────────────────────────────────────────


class MealGuide(BaseModel):
    meal: str  # "Breakfast" | "Lunch" | "Dinner"
    name: str
    description: str
    weekly_adjustment: Optional[str] = None
    adapted_for: Optional[str] = None



class RituInfo(BaseModel):
    ritu: str
    sanskrit_name: str
    english_name: str
    months: str
    aggravates: Optional[str] = None
    pacifies: Optional[str] = None


class SeasonalOverlay(BaseModel):
    note: str
    tips: List[str]
    favor: List[str]
    reduce: List[str]


class VikritiOverlay(BaseModel):
    most_aggravated: str
    tip: str
    days_ago: int
    created_at: datetime
    vata_delta: float
    pitta_delta: float
    kapha_delta: float


class DietPlanResponse(BaseModel):
    dosha: str
    dosha_principle: str
    meals: List[MealGuide]
    favor_foods: List[str]
    reduce_foods: List[str]
    ritu: RituInfo
    seasonal: SeasonalOverlay
    vikriti: Optional[VikritiOverlay] = None  # Step 2: weekly dynamic adjustment layer
    has_vikriti: bool = False  # true if recent active check-in exists (<=10 days)
    vikriti_stale: bool = False  # true if user has taken check-in but older than 10 days


# ── Vikriti Assessment Schemas (Step 2) ────────────────────────────────


class VikritiStartOut(BaseModel):
    checkin_id: int
    question: QuestionOut
    all_questions: Optional[List[QuestionOut]] = None
    total_questions: int = 10


class VikritiAnswerIn(BaseModel):
    question_id: str
    selected_dosha: str


class VikritiResultOut(BaseModel):
    checkin_id: int
    vata_score: float
    pitta_score: float
    kapha_score: float
    vata_delta: float
    pitta_delta: float
    kapha_delta: float
    most_aggravated: str
    created_at: datetime
    days_ago: int = 0
    is_stale: bool = False


class VikritiAnswerOut(BaseModel):
    checkin_id: int
    status: str  # "in_progress" | "completed"
    next_question: Optional[QuestionOut] = None
    result: Optional[VikritiResultOut] = None


class VikritiProgressionPoint(BaseModel):
    checkin_id: int
    date: str  # e.g., "2026-08-10"
    week_label: str  # e.g., "Week 1"
    vata_score: float
    pitta_score: float
    kapha_score: float
    vata_delta: float
    pitta_delta: float
    kapha_delta: float
    most_aggravated: str
    deviation_index: float
    clinical_milestone: Optional[str] = None


class VikritiProgressionResponse(BaseModel):
    baseline_prakriti: Dict[str, Any]
    timeline: List[VikritiProgressionPoint]
    current_deviation_index: float
    deviation_level: str  # "sama" | "alpa" | "madhyama" | "teevra"
    deviation_label: str  # e.g., "Alpa Vikriti (Mild Seasonal Fluctuation)"
    trend_summary: str
    trend_direction: str  # "improving" | "stable" | "elevated"
    total_checkins: int
    latest_checkin_date: Optional[str] = None
    is_demo_data: bool = False


class VikritiHistoryItem(BaseModel):
    checkin_id: int
    created_at: datetime
    date_formatted: str
    vata_score: float
    pitta_score: float
    kapha_score: float
    vata_delta: float
    pitta_delta: float
    kapha_delta: float
    most_aggravated: str
    deviation_index: float
    symptoms: Optional[Dict[str, str]] = None
    clinical_milestone: Optional[str] = None


class VikritiHistoryResponse(BaseModel):
    items: List[VikritiHistoryItem]
    total_count: int
    is_demo_data: bool = False


# ── Ritucharya Schemas ────────────────────────────────────────────────


class SeasonDoshaDynamics(BaseModel):
    chaya: Optional[str] = None
    prakopa: Optional[str] = None
    prashama: Optional[str] = None


class SeasonAhara(BaseModel):
    predominant_rasa: List[str]
    favor_foods: List[str]
    moderate_foods: List[str]
    water_guidance: str


class SeasonVihara(BaseModel):
    daily_focus: str
    bathing: str
    clothing: str
    sleep_guidance: str
    exercise_guideline: str
    ritu_sandhi_note: str
    physician_note: str


class SeasonDetail(BaseModel):
    id: str
    sanskrit_name: str
    english_name: str
    hindi_name: str
    months: str
    solstice: str
    solstice_meaning: str
    strength_level: str
    agni_state: str
    overview: str
    dosha_dynamics: SeasonDoshaDynamics
    ahara: SeasonAhara
    vihara: SeasonVihara
    chapter_ref: str


class UserSeasonFocus(BaseModel):
    is_dominant_aggravated: bool
    dominant_dosha: str
    note: str


class RitucharyaResponse(BaseModel):
    current_season_id: str
    seasons: List[SeasonDetail]
    user_focus: Optional[UserSeasonFocus] = None


# ── Dinacharya & Lifestyle Recommendation Schemas ─────────────────────


class SleepGuide(BaseModel):
    duration_hours: str
    recommended_window: str
    temperament: str
    bedtime_ritual: List[str]
    weekly_adaptation: Optional[str] = None


class ExerciseGuide(BaseModel):
    intensity_level: str
    intensity_meaning: str
    recommended_modalities: List[str]
    optimal_time: str
    weekly_adaptation: Optional[str] = None


class PranayamaGuide(BaseModel):
    technique_name: str
    technique_sanskrit: str
    description: str
    steps: List[str]
    duration: str
    contraindication: Optional[str] = None
    weekly_adaptation: Optional[str] = None


class DailyClockPhase(BaseModel):
    phase_id: str
    time_window: str
    dosha_active: str
    phase_title: str
    focus: str
    rituals: List[str]


class LifestyleRecommendationResponse(BaseModel):
    dosha: str
    sleep_guide: SleepGuide
    exercise_guide: ExerciseGuide
    pranayama_guide: PranayamaGuide
    daily_timeline: List[DailyClockPhase]
    seasonal_note: str
    has_vikriti: bool = False
    weekly_banner: Optional[str] = None
    chapter_ref: str


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class ChatQueryRequest(BaseModel):
    query: str
    active_route: Optional[str] = None
    language: str = "en"
    history: Optional[List[ChatMessage]] = None


class CitationItem(BaseModel):
    source: str
    content_snippet: str


class ChatQueryResponse(BaseModel):
    answer: str
    citations: List[CitationItem] = []
    clinical_context: Optional[dict] = None
    clinical_reasoning: Optional[str] = None
    safety_disclaimer: str


class PatientInfoOut(BaseModel):
    name: str
    email: Optional[str] = None
    dossier_id: str
    assessment_date: str
    preferred_language: str = "en"


class PrakritiDetailsOut(BaseModel):
    result_type: str
    phenotype_name: str
    phenotype_sanskrit: str
    phenotype_category: str
    vata_score: float
    pitta_score: float
    kapha_score: float
    total_questions_answered: int
    agni_type: str
    agni_description: str
    koshta_type: str
    dominant_gunas: List[str]
    physical_markers: List[str]
    psychological_markers: List[str]


class VikritiOverlayOut(BaseModel):
    has_active_checkin: bool
    most_aggravated: Optional[str] = None
    delta_percentage: Optional[float] = None
    days_ago: Optional[int] = None
    recommendation: Optional[str] = None


class DietaryBlueprintOut(BaseModel):
    tastes_to_favor: List[str]
    tastes_to_moderate: List[str]
    key_beneficial_foods: List[str]
    foods_to_minimize: List[str]
    viruddha_ahara_warnings: List[str]
    meal_routine_advice: str


class DinacharyaBlueprintOut(BaseModel):
    brahma_muhurta: str
    morning_cleansing: List[str]
    optimal_sleep: str
    exercise_rule: str
    suggested_pranayama: str


class SpiceRecommendationOut(BaseModel):
    spice_name: str
    sanskrit_name: str
    therapeutic_benefit: str


class ClassicalCitationOut(BaseModel):
    treatise: str
    reference: str
    summary: str


class ComprehensiveReportResponse(BaseModel):
    patient_info: PatientInfoOut
    prakriti: PrakritiDetailsOut
    vikriti_overlay: VikritiOverlayOut
    dietary_blueprint: DietaryBlueprintOut
    dinacharya_blueprint: DinacharyaBlueprintOut
    kitchen_pharmacopoeia: List[SpiceRecommendationOut]
    classical_citations: List[ClassicalCitationOut]
    verification_hash: str
    generated_at: str

