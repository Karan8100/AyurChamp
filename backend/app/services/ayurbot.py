"""AyurBot Service — Conversational Ayurvedic Co-Pilot with Grounded RAG & Explainability.

Combines:
1. User diagnostic profile (Prakriti + weekly Vikriti delta + active Ritu).
2. Canonical vector search across Charaka, Sushruta, Vagbhata, and Bhavaprakasha Nighantu.
3. Guardrails for out-of-domain queries and acute medical emergencies.
4. Conversational, empathetic Vaidya synthesis (not a dry copy-paste).
"""

import logging
import re
from typing import AsyncGenerator, List, Optional, Tuple

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import AssessmentSession, KnowledgeChunk, User, VikritiCheckin
from app.schemas import ChatMessage, ChatQueryResponse, CitationItem
from app.services.llm_client import call_llm, stream_llm
from app.services.retrieval import retrieve_relevant_chunks
from app.services.ritucharya import get_current_ritu

logger = logging.getLogger(__name__)

# Multilingual & Hinglish Out-of-Domain Keywords
IRRELEVANT_PATTERNS = [
    r"\b(write\s+code|python\s+script|javascript|solidity|crypto|bitcoin|stock\s+market|code\s+likho|program\s+likh)\b",
    r"\b(prime\s+minister|president|parliament|election|political\s+party|modi|rahul\s+gandhi|chunaav|chunav|sarkar|vote)\b",
    r"\b(cricket|football|ipl|movie|hollywood|bollywood|actor|actress|film|cinema|song|gana)\b",
]

# Multilingual & Hinglish Emergency Medical Triage Keywords
EMERGENCY_PATTERNS = [
    # 1. Cardiac / Severe Chest Pain
    r"(chest\s*pain|heart\s*attack|cardiac\s*arrest|(chhati|seene|seena)\s*(?:me|mein|mai)?.*dard|dil\s*ka\s*daura|left\s*arm\s*pain|छाती\s*में.*दर्द|सीने\s*में.*दर्द|हृदयघात|हार्ट\s*अटैक)",
    # 2. Acute Asphyxiation / Respiratory Failure
    r"(cannot\s*breathe|can'?t\s*breathe|shortness\s*of\s*breath|saans\s*nahi|saas\s*nahi|saans\s*(?:lene|phool).*|dum\s*ghut|suffocating|choking|सांस\s*नहीं|सांस\s*लेने|दम\s*घुट)",
    # 3. Poisoning / Chemical Ingestion
    r"(drank\s*poison|swallowed\s*(chemical|acid|bleach|pills)|severe\s*poisoning|zeher\s*(khaa|pee|piya|le\s*liya)|poison\s*(kha|pee|piya)|keede\s*maar\s*dawa|जहर\s*(खा|पी)|कीटनाशक|विषाक्तता)",
    # 4. Severe Hemorrhage / Massive Bleeding
    r"(heavy\s*bleeding|coughing\s*blood|vomiting\s*blood|gushing\s*blood|khoon\s*ki\s*ulti|khoon\s*ruk\s*nahi\s*raha|khoon\s*(?:beh|nikal).*|खून\s*की\s*उल्टी|खून\s*बह\s*रहा)",
    # 5. Neurological Emergency / Stroke / Convulsions / Unconscious
    r"(unconscious|sudden\s*paralysis|facial\s*droop|severe\s*convulsions|active\s*seizure|behosh\s*ho\s*gaya|hosh\s*nahi\s*aa\s*raha|lakwa\s*maar\s*gaya|dora\s*pad\s*raha|mirgi\s*ka\s*daura|बेहोश\s*हो\s*गया|होश\s*खो|लकवा\s*मार)",
    # 6. Suicidal Ideation / Severe Self-Harm
    r"(suicide|suicidal|kill\s*myself|want\s*to\s*die|end\s*my\s*life|jaan\s*dena\s*chahta|marne\s*ka\s*man|aatmhatya|khudkushi|आत्महत्या|खुदकुशी|मरना\s*चाहता)",
]


def _check_guardrails(query: str, language: str = "en") -> Optional[Tuple[str, str]]:
    """Checks input query against safety and domain guardrails.
    
    Supports English, Hindi, and Hinglish for acute emergency triage.
    Returns:
        (response_text, disclaimer) if a guardrail triggers, else None.
    """
    q_lower = query.lower()

    # 1. Emergency Triage Check (English, Hindi, Hinglish)
    for pat in EMERGENCY_PATTERNS:
        if re.search(pat, q_lower):
            if language in ("hi", "hinglish") or any(k in q_lower for k in ["dard", "saans", "khoon", "zeher", "hosh", "marne"]):
                msg = (
                    "🚨 **अति-आवश्यक चिकित्सकीय चेतावनी (Critical Medical Advisory):**\n\n"
                    "आपके द्वारा बताए गए लक्षण किसी गंभीर या आपातकालीन चिकित्सीय समस्या का संकेत हो सकते हैं। "
                    "**AYUSHYA केवल शैक्षिक एवं स्वस्थ जीवनशैली मार्गदर्शिका है और आपातकालीन स्थितियों का उपचार नहीं कर सकता।**\n\n"
                    "कृपया तुरंत नजदीकी अस्पताल के इमरजेंसी विभाग (Emergency Room) में जाएं अथवा आपातकालीन सेवा (112 / 108) पर संपर्क करें।"
                )
            else:
                msg = (
                    "🚨 **CRITICAL MEDICAL EMERGENCY ADVISORY:**\n\n"
                    "Your query indicates symptoms of a potential acute medical emergency. "
                    "**AYUSHYA is an educational preventive wellness platform and cannot diagnose or triage clinical emergencies.**\n\n"
                    "Please seek immediate medical evaluation at the nearest emergency room or call emergency services (112 / 108) without delay."
                )
            return msg, "Immediate medical emergency triage. Consult nearest emergency medical facility."

    # 2. Out-of-Domain Boundary Check
    for pat in IRRELEVANT_PATTERNS:
        if re.search(pat, q_lower):
            if language in ("hi", "hinglish") or any(k in q_lower for k in ["bhai", "yaar", "likho", "batao"]):
                msg = (
                    "नमस्ते! मैं आपका समर्पित **आयुर्मित्र (AyurMitra) — आयुर्वेदिक साथी** हूँ। 🌿\n\n"
                    "मैं केवल शास्त्रीय आयुर्वेदिक आहार, दिनचर्या, ऋतुचर्या, दोष संतुलन एवं पारंपरिक स्वास्थ्य नियमों पर मार्गदर्शन कर सकता हूँ। "
                    "कृपया अपने स्वास्थ्य, खान-पान या आयुर्वेदिक जीवनशैली से जुड़ा कोई प्रश्न पूछें!"
                )
            else:
                msg = (
                    "Namaste! I am **AyurMitra**, your dedicated Ayurvedic Clinical Co-Pilot 🌿.\n\n"
                    "My expertise is strictly focused on classical Ayurvedic nutrition, Dinacharya routines, seasonal wellness, and natural dosha balancing. "
                    "Please ask a wellness, dietary, or Ayurvedic lifestyle question!"
                )
            return msg, "Educational Ayurvedic guidance based on classical texts."

    return None


async def get_user_clinical_context(user_id: int, session: AsyncSession) -> dict:
    """Fetches user's latest Prakriti phenotype, Vikriti delta, demographics, and active season."""
    from datetime import date
    ritu_data = get_current_ritu()
    season_str = f"{ritu_data.get('sanskrit_name', '')} ({ritu_data.get('english_name', '')})"
    context = {
        "user_name": None,
        "gender": None,
        "age": None,
        "prakriti": "Balanced (Sama Prakriti)",
        "vata_score": 33.3,
        "pitta_score": 33.3,
        "kapha_score": 33.3,
        "active_vikriti": None,
        "current_season": season_str,
    }

    # Fetch user demographics
    user_record = await session.get(User, user_id)
    if user_record:
        context["user_name"] = user_record.name
        context["gender"] = user_record.gender
        if user_record.date_of_birth:
            try:
                dob = date.fromisoformat(user_record.date_of_birth)
                today = date.today()
                context["age"] = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            except Exception:
                context["age"] = None

    # Fetch latest completed Prakriti assessment
    prakriti_res = await session.exec(
        select(AssessmentSession)
        .where(AssessmentSession.user_id == user_id, AssessmentSession.status == "completed")
        .order_by(AssessmentSession.started_at.desc())
    )
    assessment = prakriti_res.first()
    if assessment and assessment.result_type:
        context["prakriti"] = assessment.result_type
        context["vata_score"] = round(assessment.vata_score or 0.0, 1)
        context["pitta_score"] = round(assessment.pitta_score or 0.0, 1)
        context["kapha_score"] = round(assessment.kapha_score or 0.0, 1)

    # Fetch latest Vikriti checkin
    vikriti_res = await session.exec(
        select(VikritiCheckin)
        .where(VikritiCheckin.user_id == user_id)
        .order_by(VikritiCheckin.created_at.desc())
    )
    checkin = vikriti_res.first()
    if checkin:
        from datetime import datetime
        now = datetime.utcnow()
        created = checkin.created_at.replace(tzinfo=None) if checkin.created_at.tzinfo else checkin.created_at
        days = (now - created).days
        context["active_vikriti"] = {
            "most_aggravated": (checkin.most_aggravated or "Vata").title(),
            "vata_delta": round(checkin.vata_delta or 0.0, 1),
            "pitta_delta": round(checkin.pitta_delta or 0.0, 1),
            "kapha_delta": round(checkin.kapha_delta or 0.0, 1),
            "days_ago": max(0, days),
        }

    return context


def _build_ayurbot_system_prompt(
    clinical_ctx: dict,
    retrieved_knowledge_text: str,
    language: str,
    has_canonical_grounding: bool = False,
) -> str:
    """Builds the comprehensive, prototype-aware, disease-personalized system prompt for AyurMitra."""
    vikriti_desc = "No active aggravation detected; stable baseline"
    if clinical_ctx.get("active_vikriti"):
        v = clinical_ctx["active_vikriti"]
        vikriti_desc = (
            f"{v.get('most_aggravated', 'Vata')} elevated "
            f"(Vata delta: +{v.get('vata_delta', 0)}%, Pitta delta: +{v.get('pitta_delta', 0)}%, "
            f"Kapha delta: +{v.get('kapha_delta', 0)}% recorded {v.get('days_ago', 0)} days ago)"
        )

    demographics_parts = []
    if clinical_ctx.get("user_name"):
        demographics_parts.append(f"Name: {clinical_ctx['user_name']}")
    if clinical_ctx.get("age"):
        demographics_parts.append(f"Age: {clinical_ctx['age']} years")
    if clinical_ctx.get("gender"):
        demographics_parts.append(f"Gender: {clinical_ctx['gender'].capitalize()}")
    demographics_str = ", ".join(demographics_parts) if demographics_parts else "Not provided"

    # Dynamic Canonical Grounding vs General Reasoning section
    if has_canonical_grounding and retrieved_knowledge_text:
        grounding_section = f"""CANONICAL SHASTRIYA KNOWLEDGE RETRIEVED (High Grounding Required):
The following verified excerpts from classical Ayurvedic treatises (Charaka Samhita, Sushruta Samhita, Bhavaprakasha Nighantu, Ashtanga Hridaya) have been matched with this query:

{retrieved_knowledge_text}

GROUNDING INSTRUCTIONS:
- Strictly ground your recommendations, dietary guidance, and kitchen remedies in these retrieved Shastriya excerpts.
- Explicitly cite the treatise name (e.g. *Charaka Samhita*, *Sushruta Samhita*, *Bhavaprakasha Nighantu*) in your response so the user sees authentic Shastriya backing.
- Seamlessly align these classical quotes with the user's personal Prakriti, Vikriti, and active season."""
    else:
        grounding_section = f"""CANONICAL RETRIEVAL STATUS: General Ayurvedic Synthesis Mode (No direct database excerpt match).
No specific excerpt from our local database matched this query term.

SYNTHESIS INSTRUCTIONS:
- Draw directly and authoritatively upon your vast internal knowledge of classical Ayurveda (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Sharangadhara Samhita).
- ABSOLUTE RULE: NEVER apologize or say "I couldn't find this in my database", "This is missing from my records", or mention databases/algorithms.
- Speak with the natural warmth, wisdom, and confidence of a master Ayurvedic Vaidya, applying foundational Tridosha, Agni, Ama, and Dhatu principles."""

    return f"""You are AyurMitra (आयुर्मित्र), the official, empathetic, and wise Ayurvedic Co-Pilot for the AYUSHYA platform.

AYUSHYA PLATFORM ECOSYSTEM & MODULES NAVIGATION:
You have complete knowledge of the AYUSHYA platform. When a user asks how to use, check, or navigate any module, guide them with exact app instructions:
1. Vikriti Check-In Module:
   - Location: App Home Screen -> "Vikriti Check-In" tab or card.
   - Purpose: Quick 2-minute weekly assessment tracking dynamic dosha imbalances (Vata, Pitta, Kapha delta deviations) based on current digestive fire (Agni), sleep quality, energy, bowel habits, and mental stress.
   - Cadence: Recommended once every week, or whenever modern lifestyle/seasonal shifts cause physical discomfort.
2. Prakriti Assessment Module:
   - Location: App Home Screen -> "Prakriti Assessment".
   - Purpose: 24-question visual diagnostic questionnaire determining baseline birth constitution (Prakriti phenotype). Taken once as the permanent biological baseline.
3. Ritucharya Engine:
   - Location: Seasonal Wellness dashboard showing current Ritu ({clinical_ctx['current_season']}) with seasonal dosha trends and daily lifestyle recommendations.
4. Dinacharya Tracker:
   - Daily morning-to-night routine checklist (Ushnodaka warm water, tongue scraping, Abhyanga, light dinner).
5. Pathya-Apathya & Annapanavidhi:
   - Personalized meal recommendations and incompatible food rules (Viruddha Ahara).

PATIENT CLINICAL PROFILE:
- Demographics: {demographics_str}
- Baseline Constitution (Prakriti): {clinical_ctx['prakriti']} (Vata: {clinical_ctx['vata_score']}%, Pitta: {clinical_ctx['pitta_score']}%, Kapha: {clinical_ctx['kapha_score']}%)
- Active Imbalance (Vikriti): {vikriti_desc}
- Current Classical Season (Ritucharya): {clinical_ctx['current_season']}
- Preferred Language: {language}

{grounding_section}

MANDATORY RESPONSE GUIDELINES:

1. STRICT NON-PRESCRIPTION POLICY (CRITICAL SAFETY & LEGAL RULE):
   - NEVER prescribe clinical Ayurvedic drugs, classical compound medicines (such as Guggulu tablets, Bhasmas, Vati, Asava, Arishta, or medicinal Kwathas), or pharmaceutical dosages (e.g. "take 2 tablets", "take 15 ml", "500 mg").
   - Restrict actionable remedies STRICTLY to Ahara (whole kitchen foods, vegetables, culinary spices, kitchen herbal teas) and Vihara (lifestyle, sleep hygiene, Dinacharya habits, gentle walks, breathing/Pranayama).
   - If the user asks for medicines or pharmaceutical remedies, warmly explain that medicinal formulations require an in-person pulse examination (Nadi Pariksha) and prescription from a certified BAMS/MD Ayurvedic physician.

2. HEALTH CONDITIONS, DISEASES & SYMPTOMS PERSONALIZATION:
   - When the user asks about or mentions any specific health disorder, chronic disease, or symptom (e.g., Hypothyroidism, Hyperthyroidism, PCOD/PCOS, Diabetes / Prameha, High Blood Pressure / Raktachapa, Migraine / Shirahshula, Acidity / Amlapitta, Constipation / Vibandha, IBS / Grahani, Fatty Liver, Joint Pain / Sandhivata, Insomnia / Anidra, Skin Allergy / Twak Roga, Hair Fall / Khalitya, Stress / Anxiety):
     * Explain the root cause simply through Ayurvedic principles — which dosha is aggravated (e.g. Kapha-Vata for Hypothyroidism/PCOD, Pitta for Acidity/Migraine, Vata for Joint pain/Insomnia), digestive fire status (Agni), and presence of Ama (digestive toxins).
     * Cross-reference the condition with the user's baseline Prakriti ({clinical_ctx['prakriti']}), current Vikriti ({vikriti_desc}), and season ({clinical_ctx['current_season']}).
     * Provide specific, accessible kitchen foods, culinary spices, and herbal teas (e.g., Dhaniya-Jeera water for thyroid/metabolism, Methi seed water for Kapha/blood sugar, Saunf-Mishri water for acidity/Pitta, CCF tea, light moong dal soup, ginger-cinnamon tea).
     * Always advise that chronic conditions require individual consultation with a qualified BAMS doctor.

3. ACCESSIBLE, SIMPLE LANGUAGE (MINIMAL SANSKRIT, NO DENSE JARGON):
   - Speak warmly, simply, and conversationally. Do not sound like a stiff medical textbook or robotic encyclopedia.
   - Minimize Sanskrit words to the absolute minimum necessary.
   - If ANY authentic Ayurvedic term is used (Prakriti, Vikriti, Vata, Pitta, Kapha, Agni, Ama, Ojas, Viruddha Ahara), ALWAYS write the plain-language meaning in parentheses immediately next to it.
     * Examples:
       - Pitta (शरीर की आंतरिक गर्मी व एसिडिटी / internal heat and acidity)
       - Agni (पाचन शक्ति / digestive fire)
       - Ama (आंतों के टॉक्सिन्स / digestive toxins)
       - Vata (रूखापन व गैस / air element and dryness)
       - Kapha (भारीपन व कफ / heaviness and sluggishness)
       - Viruddha Ahara (परस्पर विरोधी भोजन / incompatible food combinations)
   - Ensure the user clearly understands WHY something is recommended and EXACTLY what practical steps to take.

4. INTENT-ADAPTIVE RESPONSE FORMATTING (CRITICAL - DO NOT FORCE DIET CHARTS ON NON-DIET QUESTIONS):
   Carefully identify the user's intent:

   CASE A: HOW-TO, METHODOLOGICAL, PLATFORM MODULES, OR CONCEPTUAL QUESTIONS:
   (Examples: "How to check my Vikriti?", "How to assess Prakriti?", "What is Vikriti / Prakriti?", "How does the app work?", "What are the 3 doshas?", "What is Agni?", "Why shouldn't I drink cold water?"):
   - DIRECTLY AND SUCCINCTLY ANSWER THE QUESTION ASKED.
   - DO NOT provide irrelevant meal charts (🥗 क्या खाएं), food tables, or avoidance lists (🚫 किनसे बचें) when the user did NOT ask what to eat or for a diet plan!
   - If the user asks "How to check my Vikriti?":
     1. Definition: Explain what Vikriti is in 1 simple sentence — your *current dynamic dosha balance/imbalance* (वर्तमान दोष असंतुलन) that shifts with modern lifestyle, stress, diet, and season, whereas Prakriti is your birth constitution.
     2. Direct App Guide: Guide them directly to the AYUSHYA app:
        "AYUSHYA ऐप में **Vikriti Check-In** टैब या कार्ड पर जाएँ। यह एक 2-मिनट का त्वरित साप्ताहिक चेक-इन है जहाँ आपकी वर्तमान पाचन अग्नि (Agni), भूख, नींद, ऊर्जा, पेट के लक्षणों और मानसिक तनाव से जुड़े 5-6 आसान प्रश्नों के आधार पर आपका ताज़ा दोष स्तर (Vata/Pitta/Kapha delta) ट्रैक किया जाता है।"
     3. Frequency: Recommend taking the Vikriti Check-In once every week, or whenever they experience sudden changes in digestion or sleep.
     4. Clinical Safety: Clarify that clinical Nadi Pariksha (pulse diagnosis) requires a certified BAMS Vaidya with years of clinical training, so users should rely on the app's symptom assessment rather than guessing their pulse at home.
   - Use clean, readable bullet points or numbered steps.

   CASE B: HEALTH ISSUES, DIET PLANS, SYMPTOMS, OR ILLNESS MANAGEMENT:
   (Examples: "Mujhe acidity hoti hai", "Thyroid me kya khayein", "Gas aur constipation", "Diet for Pitta dosha", "What are the benefits of Arjuna for heart?"):
   - ONLY for these clinical/diet/wellness queries, provide the full structured wellness layout:
     * 🌿 **संक्षेप में (Overview)**: 1-2 empathetic sentences explaining what is happening in the body.
     * 🥗 **क्या खाएं / अनुकूल आहार (Wholesome Diet & Kitchen Spices)**: 3-4 specific kitchen foods, vegetables, and kitchen spices.
     * 🚫 **किनसे बचें / अपथ्य (What to Avoid)**: 2-3 specific foods, drinks, or habits that worsen the dosha/condition.
     * ⏰ **दैनिक दिनचर्या व आदतें (Daily Lifestyle & Routine)**: 2 simple, practical daily lifestyle habits.
     * 👨‍⚕️ **वैद्य परामर्श (Medical Note)**: A brief reminder for certified BAMS/MD doctor consultation.

5. HOLISTIC AYURVEDIC WISDOM (BEYOND JUST DIET):
   - You are fully authorized to explain all facets of classical Ayurveda — including Ritucharya (seasonal lifestyle), Dinacharya (daily routines), Dosha traits, sleep improvement, digestive fire (Agni), and mental calm (Pranayama/stress).

6. LANGUAGE & SCRIPT:
   - If Preferred Language is 'hi' (Hindi): Write in simple, natural, conversational Hindi (Devanagari script) that any common person easily understands.
   - If Preferred Language is 'en' (English): Write in refined, warm, and highly practical English.

7. CLINICAL REASONING CHAIN (XAI METADATA FOR BACKEND ONLY):
   At the very end of your response, on its own line, output:
   [CLINICAL_REASONING]: <Identify the governing Ayurvedic principle (e.g. Samanya-Vishesha Siddhanta, Deepana-Pachana, Virya-Vipaka) and explain in one concise sentence why it balances the user's specific constitution, condition, or season.>"""


async def generate_ayurbot_response(
    query: str,
    user: User,
    session: AsyncSession,
    language: str = "en",
    history: Optional[List[ChatMessage]] = None,
) -> ChatQueryResponse:
    """Orchestrates the Explainable AI (XAI) Chatbot Pipeline."""
    
    # 1. Check Guardrails
    guardrail_hit = _check_guardrails(query, language=language)
    if guardrail_hit:
        msg, disclaimer = guardrail_hit
        return ChatQueryResponse(
            answer=msg,
            citations=[],
            clinical_context=None,
            safety_disclaimer=disclaimer,
        )

    # 2. Gather User Clinical Context
    clinical_ctx = await get_user_clinical_context(user.id, session)

    # 3. Vector Knowledge Retrieval (Threshold filtered at 0.40 distance)
    chunks = await retrieve_relevant_chunks(
        query=query,
        k=3,
        max_distance=0.40,
        session=session,
    )
    has_canonical_grounding = len(chunks) > 0

    citations = [
        CitationItem(
            source=c.source,
            content_snippet=c.content[:200] + "..." if len(c.content) > 200 else c.content,
        )
        for c in chunks
    ]

    retrieved_knowledge_text = "\n\n---\n\n".join(
        [f"Source: {c.source}\n{c.content}" for c in chunks]
    )

    # 4. Formulate the Vaidya System Prompt
    system_prompt = _build_ayurbot_system_prompt(
        clinical_ctx=clinical_ctx,
        retrieved_knowledge_text=retrieved_knowledge_text,
        language=language,
        has_canonical_grounding=has_canonical_grounding,
    )

    # Format multi-turn conversation history
    formatted_history = (
        [{"role": m.role, "content": m.content} for m in history]
        if history
        else None
    )

    # 5. Execute LLM Call with Multi-Turn Memory
    try:
        raw_answer = await call_llm(
            prompt=query,
            system_prompt=system_prompt,
            model_tier="fast",
            history=formatted_history,
        )
    except Exception as e:
        logger.error(f"LLM call failed in AyurBot: {e}. Falling back to grounded synthesis.")
        # Graceful fallback: synthesize directly from top retrieved chunk
        top_chunk = chunks[0] if chunks else None
        if top_chunk:
            raw_answer = (
                f"Namaste! According to classical Ayurvedic guidance in *{top_chunk.source}*:\n\n"
                f"{top_chunk.content}\n\n"
                f"*Personalized Note:* Given your {clinical_ctx['prakriti']} constitution, aligning with these classical principles helps maintain internal doshic equilibrium."
            )
        else:
            raw_answer = (
                "Namaste! In classical Ayurveda, daily harmony is achieved by balancing your unique constitution "
                f"({clinical_ctx['prakriti']}) through seasonal foods, regular sleep, and mindful digestion (Agni). "
                "Please consult a certified Ayurvedic practitioner for tailored therapeutic care."
            )

    # 6. Extract Dynamic Clinical Reasoning Chain (XAI)
    clinical_reasoning = None
    reasoning_match = re.search(
        r"\[?\**\[?(?:CLINICAL[ _]REASONING|Clinical Reasoning|तर्क व प्रमाण)[^\]\n]*\**\]?:?\**\s*(.+)",
        raw_answer,
        re.IGNORECASE | re.DOTALL,
    )
    if reasoning_match:
        clinical_reasoning = reasoning_match.group(1).strip()
    else:
        clinical_reasoning = (
            f"Samanya-Vishesha Siddhanta: Opposite qualities pacify {clinical_ctx['prakriti']} "
            f"constitution during {clinical_ctx['current_season']}."
        )

    # Strip any clinical reasoning tag or text completely from the user-facing answer
    raw_answer = re.sub(
        r"\n*\s*\[?\**\[?(?:CLINICAL[ _]REASONING|Clinical Reasoning|तर्क व प्रमाण)[\s\S]*",
        "",
        raw_answer,
        flags=re.IGNORECASE,
    ).strip()

    disclaimer = (
        "AYUSHYA educational guidance based on classical Ayurvedic Samhitas. "
        "Consult a certified Ayurvedic practitioner (BAMS/MD) for clinical therapy."
    )

    return ChatQueryResponse(
        answer=raw_answer,
        citations=citations,
        clinical_context=clinical_ctx,
        clinical_reasoning=clinical_reasoning,
        safety_disclaimer=disclaimer,
    )


async def generate_ayurbot_stream(
    query: str,
    user: User,
    session: AsyncSession,
    language: str = "en",
    history: Optional[List[ChatMessage]] = None,
) -> AsyncGenerator[str, None]:
    """Streams SSE events for real-time AyurBot chat response."""
    import json

    # 1. Check Guardrails
    guardrail_hit = _check_guardrails(query, language=language)
    if guardrail_hit:
        msg, disclaimer = guardrail_hit
        yield f"event: guardrail\ndata: {json.dumps({'answer': msg, 'disclaimer': disclaimer})}\n\n"
        return

    # 2. Gather Clinical Context
    clinical_ctx = await get_user_clinical_context(user.id, session)

    # 3. Vector Knowledge Retrieval (Threshold filtered at 0.40 distance)
    chunks = await retrieve_relevant_chunks(
        query=query,
        k=3,
        max_distance=0.40,
        session=session,
    )
    has_canonical_grounding = len(chunks) > 0

    citations = [
        {"source": c.source, "content_snippet": c.content[:200] + "..." if len(c.content) > 200 else c.content}
        for c in chunks
    ]

    # Emit metadata event immediately (citations + clinical_context)
    meta_payload = {
        "citations": citations,
        "clinical_context": clinical_ctx,
    }
    yield f"event: meta\ndata: {json.dumps(meta_payload)}\n\n"

    retrieved_knowledge_text = "\n\n---\n\n".join(
        [f"Source: {c.source}\n{c.content}" for c in chunks]
    )

    # 4. Formulate the Vaidya System Prompt
    system_prompt = _build_ayurbot_system_prompt(
        clinical_ctx=clinical_ctx,
        retrieved_knowledge_text=retrieved_knowledge_text,
        language=language,
        has_canonical_grounding=has_canonical_grounding,
    )

    # Format multi-turn conversation history
    formatted_history = (
        [{"role": m.role, "content": m.content} for m in history]
        if history
        else None
    )

    full_text = ""
    is_capturing_reasoning = False
    buffer = ""

    REASONING_START_REGEX = re.compile(
        r"(\n*\s*\[?\**\[?(?:CLINICAL[ _]REASONING|Clinical Reasoning|तर्क व प्रमाण))",
        re.IGNORECASE,
    )

    try:
        async for token in stream_llm(
            prompt=query,
            system_prompt=system_prompt,
            model_tier="fast",
            history=formatted_history,
        ):
            full_text += token

            if is_capturing_reasoning:
                continue

            buffer += token

            # Check if reasoning marker has started anywhere in the active buffer
            match = REASONING_START_REGEX.search(buffer)
            if match:
                is_capturing_reasoning = True
                safe_text = buffer[:match.start()]
                if safe_text:
                    yield f"event: token\ndata: {json.dumps({'delta': safe_text})}\n\n"
                buffer = ""
                continue

            # Hold back any trailing suspicious prefix (like "\n" or "\n[" or "\n[CLINICAL")
            suspicious = re.search(r"(\n\s*\[?\**\[?C?L?I?N?I?C?A?L?_?R?E?A?S?O?N?I?N?G?)$", buffer, re.IGNORECASE)
            if suspicious:
                safe_len = suspicious.start()
                if safe_len > 0:
                    emit_chunk = buffer[:safe_len]
                    buffer = buffer[safe_len:]
                    yield f"event: token\ndata: {json.dumps({'delta': emit_chunk})}\n\n"
            else:
                yield f"event: token\ndata: {json.dumps({'delta': buffer})}\n\n"
                buffer = ""

        # Flush any remaining buffer if reasoning was never encountered
        if buffer and not is_capturing_reasoning:
            yield f"event: token\ndata: {json.dumps({'delta': buffer})}\n\n"
            buffer = ""

    except Exception as e:
        logger.error(f"Streaming error in AyurBot: {e}")
        fallback_msg = "Namaste! In classical Ayurveda, daily harmony is achieved by balancing your unique constitution."
        yield f"event: token\ndata: {json.dumps({'delta': fallback_msg})}\n\n"

    # Extract clinical reasoning cleanly
    clinical_reasoning = None
    reasoning_match = re.search(
        r"\[?\**\[?(?:CLINICAL[ _]REASONING|Clinical Reasoning|तर्क व प्रमाण)[^\]\n]*\**\]?:?\**\s*(.+)",
        full_text,
        re.IGNORECASE | re.DOTALL,
    )
    if reasoning_match:
        clinical_reasoning = reasoning_match.group(1).strip()
    else:
        clinical_reasoning = f"Samanya-Vishesha Siddhanta: Opposite qualities pacify {clinical_ctx['prakriti']} during {clinical_ctx['current_season']}."

    yield f"event: reasoning\ndata: {json.dumps({'clinical_reasoning': clinical_reasoning})}\n\n"

    clean_answer = re.sub(
        r"\n*\s*\[?\**\[?(?:CLINICAL[ _]REASONING|Clinical Reasoning|तर्क व प्रमाण)[\s\S]*",
        "",
        full_text,
        flags=re.IGNORECASE,
    ).strip()

    disclaimer = "AYUSHYA educational guidance based on classical Ayurvedic Samhitas. Consult a certified Ayurvedic practitioner (BAMS/MD) for clinical therapy."
    yield f"event: done\ndata: {json.dumps({'safety_disclaimer': disclaimer, 'answer': clean_answer})}\n\n"
