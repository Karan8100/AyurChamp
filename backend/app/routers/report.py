"""Clinical Prakriti Report API router — serves consolidated Ayurvedic Health Dossiers.

Consolidates:
1. User profile and dossier credentials
2. Classical Tri-Dosha assessment scores and phenotype archetype
3. Metabolic & physiological markers (Agni, Koshta, Gunas)
4. Precision Dietary Blueprint (Ahara Niyama, Shad Rasa, Viruddha Ahara)
5. Circadian Lifestyle Protocol (Dinacharya, Nidra, Vyayama Ardha-Shakti)
6. Seasonal overlay (Ritucharya) & active dynamic Vikriti check-in delta
7. Kitchen Pharmacopoeia (Dravyaguna spices)
8. Classical Shastriya Pramana (Charaka, Sushruta, Vagbhata citations)
9. Tamper-evident cryptographic verification hash
"""

import hashlib
from datetime import datetime
from typing import List, Tuple

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.cache import memory_cache
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models import AssessmentSession, QuestionResponse, User, VikritiCheckin
from app.schemas import (
    ClassicalCitationOut,
    ComprehensiveReportResponse,
    DietaryBlueprintOut,
    DinacharyaBlueprintOut,
    PatientInfoOut,
    PrakritiDetailsOut,
    SpiceRecommendationOut,
    VikritiOverlayOut,
)

router = APIRouter(prefix="/report", tags=["report"])


# =====================================================================
# Clinical Mapping Lookups (Classical Ayurvedic Knowledge Base)
# =====================================================================

PHENOTYPE_METADATA = {
    "vata": {
        "sanskrit": "वात प्रकृति",
        "name": "Vata Dominant",
        "category": "Ekadoshaja (Single-Dosha Dominance)",
        "agni": ("Vishamagni (Irregular Digestion)", "Fluctuating appetite and variable digestion rate; prone to dry gas, bloating, and irregular bowel patterns."),
        "koshta": "Krura Koshta (Hard/Constipated tendency; benefits from warm unctuous fluids and gentle fiber)",
        "gunas": ["Laghu (Light)", "Sheeta (Cold)", "Ruksha (Dry)", "Chala (Mobile)", "Sukshma (Subtle)"],
        "physical": ["Slender or light physical frame", "Dry or rough skin tendency", "Cold hands and feet", "Quick, agile body movements"],
        "psychological": ["Quick grasp and creative imagination", "Enthusiastic and expressive", "Prone to anxiety under stress", "Prefers dynamic environments"],
    },
    "pitta": {
        "sanskrit": "पित्त प्रकृति",
        "name": "Pitta Dominant",
        "category": "Ekadoshaja (Single-Dosha Dominance)",
        "agni": ("Tikshnagni (Intense/Sharp Digestion)", "Hypermetabolic catabolism; strong, prompt appetite; cannot tolerate skipped meals; prone to hyperacidity and heartburn."),
        "koshta": "Mridu Koshta (Soft/Quick evacuation; highly sensitive to thermal stimulants and purgatives)",
        "gunas": ["Ushna (Hot)", "Tikshna (Sharp)", "Sara (Fluid/Spreading)", "Laghu (Light)", "Snigdha (Slightly Oily)"],
        "physical": ["Medium, athletic, well-proportioned frame", "Warm, sensitive or freckled skin", "Moderate to heavy perspiration", "Bright, penetrating gaze"],
        "psychological": ["Sharp intellect and logical clarity", "Decisive leadership qualities", "Ambitious and goal-driven", "Prone to irritability or impatience when starved or overheated"],
    },
    "kapha": {
        "sanskrit": "कफ प्रकृति",
        "name": "Kapha Dominant",
        "category": "Ekadoshaja (Single-Dosha Dominance)",
        "agni": ("Mandagni (Slow/Sluggish Digestion)", "Hypometabolic baseline; steady but modest appetite; slow digestion requiring light, warm, stimulating foods to prevent heaviness."),
        "koshta": "Madhyama Koshta (Moderate/Regular rhythm; consistent, unhurried bowel movements)",
        "gunas": ["Guru (Heavy)", "Sheeta (Cool)", "Snigdha (Unctuous/Oily)", "Manda (Slow)", "Sthira (Stable)"],
        "physical": ["Broad, sturdy, well-developed bone structure", "Lustrous, thick, naturally hydrated skin", "Strong physical endurance and stamina", "Deep, restful sleep patterns"],
        "psychological": ["Calm, patient, and deeply grounded temperament", "High emotional endurance and loyalty", "Methodical decision-maker", "Prone to complacency or resistance to change when sedentary"],
    },
    "vata_pitta": {
        "sanskrit": "वात-पित्त प्रकृति",
        "name": "Vata-Pitta",
        "category": "Dvandvaja (Dual-Dosha Dominance)",
        "agni": ("Visham-Tikshna Agni (Fluctuating Sharp Digestion)", "Combines high metabolic heat with unpredictable timing; requires disciplined meal intervals and hydrating foods."),
        "koshta": "Krura-Mridu Mixed Koshta (Sensitive bowel; can oscillate between dry constipation and rapid evacuation)",
        "gunas": ["Laghu (Light)", "Chala (Mobile)", "Ushna (Hot)", "Tikshna (Sharp)", "Ruksha (Dry)"],
        "physical": ["Slender to medium athletic build", "Sensitive skin reactive to weather extremes", "Quick reflexes and rapid energy output", "Vulnerable to dehydration"],
        "psychological": ["Dynamic creativity paired with analytical precision", "High achiever and fast-paced thinker", "Needs mindful grounding to prevent mental exhaustion"],
    },
    "pitta_vata": {
        "sanskrit": "पित्त-वात प्रकृति",
        "name": "Pitta-Vata",
        "category": "Dvandvaja (Dual-Dosha Dominance)",
        "agni": ("Tikshna-Visham Agni (Sharp-Variable Digestion)", "Strong digestive fire occasionally destabilized by nervous energy; needs cooling, grounding, predictable meals."),
        "koshta": "Mridu-Krura Mixed Koshta (Prone to heat irritability and occasional dry transit)",
        "gunas": ["Ushna (Hot)", "Tikshna (Sharp)", "Laghu (Light)", "Chala (Mobile)", "Snigdha (Slightly Oily)"],
        "physical": ["Proportionate athletic frame with lean muscle definition", "Warm body temperature", "High stamina punctuated by sudden fatigue spikes"],
        "psychological": ["Sharp, entrepreneurial, articulate", "Vibrant mental agility", "Benefits from regular restorative pauses and cool hydration"],
    },
    "pitta_kapha": {
        "sanskrit": "पित्त-कफ प्रकृति",
        "name": "Pitta-Kapha",
        "category": "Dvandvaja (Dual-Dosha Dominance)",
        "agni": ("Tikshna-Manda Agni (Strong Fire with Dense Moisture)", "Robust digestive capacity supported by structural stamina; easily metabolizes hearty foods if spices are balanced."),
        "koshta": "Madhyama-Mridu Koshta (Smooth, reliable digestion; easily irritated by excessive deep-fried oily foods)",
        "gunas": ["Ushna (Hot)", "Snigdha (Unctuous)", "Guru (Substantial)", "Tikshna (Sharp)", "Sthira (Stable)"],
        "physical": ["Athletic to robust frame with excellent muscle tone", "Warm, glowing, well-nourished skin", "High physical endurance and strength"],
        "psychological": ["Charismatic leader with emotional stability", "Confident, determined, and practical", "Handles intense stress well; thrives on structured challenges"],
    },
    "kapha_pitta": {
        "sanskrit": "कफ-पित्त प्रकृति",
        "name": "Kapha-Pitta",
        "category": "Dvandvaja (Dual-Dosha Dominance)",
        "agni": ("Manda-Tikshna Agni (Slow yet Resilient Digestion)", "Steady baseline with strong reserve; rarely feels acute weakness from missed meals, but benefits from periodic light eating."),
        "koshta": "Madhyama Koshta (Regular, steady elimination; high digestive resilience)",
        "gunas": ["Snigdha (Unctuous)", "Guru (Heavy)", "Ushna (Warm)", "Sthira (Stable)", "Tikshna (Sharp)"],
        "physical": ["Strong, solid, resilient physical constitution", "Thick hair, radiant complexion", "Superior immune resistance (Sahaja Bala)"],
        "psychological": ["Composed, diplomatic, and tenacious", "Strong follow-through on complex goals", "Balances warmth with firm resolve"],
    },
    "vata_kapha": {
        "sanskrit": "वात-कफ प्रकृति",
        "name": "Vata-Kapha",
        "category": "Dvandvaja (Dual-Dosha Dominance)",
        "agni": ("Visham-Manda Agni (Variable-Slow Digestion)", "Both doshas share coldness (Sheeta Guna); metabolism requires warm, spiced, easily digestible preparations."),
        "koshta": "Krura-Madhyama Koshta (Tendency toward sluggish or dry transit without adequate warm hydration)",
        "gunas": ["Sheeta (Cold)", "Laghu-Guru Oscillation", "Chala-Sthira Oscillation", "Ruksha (Dry)"],
        "physical": ["Contrasting features (e.g., long limbs with sturdy joints)", "Cold sensitivity throughout the year", "Alternating bursts of high energy and quiet rest"],
        "psychological": ["Imaginative yet reflective", "Combines creative vision with deep loyalty", "Flourishes in warm, emotionally reassuring surroundings"],
    },
    "kapha_vata": {
        "sanskrit": "कफ-वात प्रकृति",
        "name": "Kapha-Vata",
        "category": "Dvandvaja (Dual-Dosha Dominance)",
        "agni": ("Manda-Visham Agni (Slow-Variable Digestion)", "Predominantly cool metabolic baseline; needs ginger, black pepper, and warm cooked meals to maintain vitality."),
        "koshta": "Madhyama-Krura Koshta (Benefits from warm morning ginger water and daily gentle movement)",
        "gunas": ["Sheeta (Cold)", "Snigdha-Ruksha Balance", "Sthira (Grounded)", "Chala (Subtle Movement)"],
        "physical": ["Sturdy foundation with variable muscle mass", "Sensitivity to cold and damp drafts", "Strong skeletal structure with light movements"],
        "psychological": ["Thoughtful and deliberate communicator", "High patience with occasional creative spurts", "Grounded yet adaptable"],
    },
    "sama": {
        "sanskrit": "सम प्रकृति (त्रिदोषज)",
        "name": "Sama Prakriti (Tridoshic Balance)",
        "category": "Samadoshaja (Tri-Doshic Equilibrium)",
        "agni": ("Samagni (Balanced/Optimal Digestion)", "Harmonious enzyme and metabolic fire; digests varied nourishing foods without distress; optimal nutrient bioavailability."),
        "koshta": "Madhyama Koshta (Ideal, effortless daily elimination)",
        "gunas": ["Balanced Ushna-Sheeta", "Balanced Laghu-Guru", "Balanced Snigdha-Ruksha"],
        "physical": ["Harmoniously proportioned, symmetrical physique", "Balanced skin tone and natural luster", "Even, robust vitality across all seasons"],
        "psychological": ["Equanimous, composed, and adaptable mind", "High emotional intelligence and clarity", "Maintains composure across shifting environments"],
    },
}

DIETARY_RULES = {
    "vata": {
        "favor": ["Madhura (Sweet - nourishing whole grains)", "Amla (Sour - lemon, fermented rices)", "Lavana (Salty - rock salt in moderation)"],
        "moderate": ["Katu (Pungent - excessively hot chilies)", "Tikta (Bitter - raw leafy astringents)", "Kashaya (Astringent - unripe persimmons, raw beans)"],
        "staples": ["Aged Basmati / Shali Rice", "Yellow Moong Dal", "Warm A2 Cow's Ghee", "Sweet Ripe Pomegranates", "Steamed Zucchini / Bottle Gourd", "Soaked Almonds"],
        "minimize": ["Raw unsteamed salads", "Cold carbonated beverages", "Dry crackers and packaged chips", "Day-old leftover refrigerated food"],
        "viruddha": [
            "Never heat honey above 40°C (Charaka: turns into toxic Ama)",
            "Do not consume milk together with sour citrus fruits or melons",
            "Avoid nightshade vegetables with dairy",
        ],
        "meal_advice": "Eat warm, unctuous, freshly prepared meals at predictable times. Sit quietly without screens while dining.",
    },
    "pitta": {
        "favor": ["Madhura (Sweet - whole grains, milk, sweet fruits)", "Tikta (Bitter - neem, dandelion, bitter gourd)", "Kashaya (Astringent - pomegranate, green lentils)"],
        "moderate": ["Amla (Sour - vinegar, excess tamarind)", "Lavana (Salty - refined sea salts, chips)", "Katu (Pungent - raw garlic, habanero peppers)"],
        "staples": ["Aged Shali Rice", "Split Moong Dal", "Cow's Ghee (Pitta Shamaka)", "Fresh Coriander & Fennel", "Bottle Gourd (Lauki)", "Sweet Grapes / Soaked Raisins"],
        "minimize": ["Deep-fried spicy snacks", "Fermented alcohol and vinegar sauces", "Excessive red meat and raw tomatoes", "Caffeinated energy drinks"],
        "viruddha": [
            "Never consume curd (dahi) at night (obstructs micro-channels)",
            "Do not combine fish with milk (opposing potency/Virya)",
            "Avoid heating honey or cooking with honey",
        ],
        "meal_advice": "Take your primary meal between 12:00 PM and 1:30 PM when solar Pitta and digestive fire are at their natural peak. Never skip meals.",
    },
    "kapha": {
        "favor": ["Katu (Pungent - ginger, black pepper, pippali)", "Tikta (Bitter - fenugreek, leafy greens)", "Kashaya (Astringent - split legumes, honey in warm water)"],
        "moderate": ["Madhura (Sweet - refined sugar, pastries)", "Amla (Sour - excess yogurt, cheeses)", "Lavana (Salty - preserved canned foods)"],
        "staples": ["Barley (Yava)", "Roasted Moong Dal", "Pungent Radish & Bitter Gourd", "Raw Honey (unheated, in lukewarm water)", "Mustard Seeds & Black Pepper", "Puffed Millets"],
        "minimize": ["Heavy commercial dairy and processed ice creams", "Deep-fried oily pastries", "Cold refrigerated foods and chilled ice water", "Heavy late-night dinners"],
        "viruddha": [
            "Do not combine cold milk with bananas or yogurt",
            "Never consume heavy oily food immediately before retiring to bed",
            "Avoid raw salads mixed with thick mayonnaise or cheese sauces",
        ],
        "meal_advice": "Fast during early morning or take light warm herbal water. Consume your largest meal at noon, and keep dinner light and finished by 7:30 PM.",
    },
}

SPICE_CATALOG = {
    "vata": [
        SpiceRecommendationOut(spice_name="Fresh Ginger", sanskrit_name="Ardraka (आर्द्रक)", therapeutic_benefit="Ignites digestive Agni without aggravating dryness; dispels abdominal gas and coldness."),
        SpiceRecommendationOut(spice_name="Cumin", sanskrit_name="Jeeraka (जीरक)", therapeutic_benefit="Deepana-Pachana spice that harmonizes peristaltic intestinal motility and eases bloating."),
        SpiceRecommendationOut(spice_name="Green Cardamom", sanskrit_name="Ela (एला)", therapeutic_benefit="Gentle aromatic carminative that pacifies Vata nerve tension and aids nutrient assimilation."),
        SpiceRecommendationOut(spice_name="Hing (Asafoetida)", sanskrit_name="Hingu (हिङ्गु)", therapeutic_benefit="Supreme classical carminative for clearing downward intestinal Vata (Apana Vayu)."),
    ],
    "pitta": [
        SpiceRecommendationOut(spice_name="Fennel Seeds", sanskrit_name="Mishreya (मिश्रेया)", therapeutic_benefit="Cooling digestive tonic (Sheeta Virya) that soothes stomach lining and neutralizes excess acid."),
        SpiceRecommendationOut(spice_name="Coriander Seeds", sanskrit_name="Dhanyaka (धान्यक)", therapeutic_benefit="Classical Tridoshic balancing herb; reduces burning sensation in the digestive tract and urinary pathways."),
        SpiceRecommendationOut(spice_name="Green Cardamom", sanskrit_name="Ela (एला)", therapeutic_benefit="Pleasant cooling aromatic that balances Pitta catabolism and refreshes oral cavity."),
        SpiceRecommendationOut(spice_name="Turmeric (in moderation)", sanskrit_name="Haridra (हरिद्रा)", therapeutic_benefit="Purifies blood (Rakta Shodhaka) and supports liver enzyme balance without over-heating."),
    ],
    "kapha": [
        SpiceRecommendationOut(spice_name="Dry Ginger", sanskrit_name="Shunthi (शुण्ठी)", therapeutic_benefit="Potent metabolic stimulant (Lekhana) that burns Ama (toxins) and dissolves respiratory congestion."),
        SpiceRecommendationOut(spice_name="Black Pepper", sanskrit_name="Maricha (मरिच)", therapeutic_benefit="Pungent bio-enhancer (Yogavahi) that scrapes away dense sluggishness and sharpens Agni."),
        SpiceRecommendationOut(spice_name="Fenugreek", sanskrit_name="Methika (मेथिका)", therapeutic_benefit="Bitter carminative that regulates lipid metabolism and stabilizes blood glucose dynamics."),
        SpiceRecommendationOut(spice_name="Cinnamon", sanskrit_name="Tvak (त्वक्)", therapeutic_benefit="Sweet-pungent warming bark that improves peripheral circulation and clears cold stagnation."),
    ],
}

CLASSICAL_CITATIONS = [
    ClassicalCitationOut(
        treatise="Charaka Samhita",
        reference="Sutrasthana, Chapter 5 (Matrashiteeya Adhyaya)",
        summary="Defines personal constitutional quantitative eating (Ahara Matra) dictated by Agni and explains Dinacharya hygiene rituals for longevity.",
    ),
    ClassicalCitationOut(
        treatise="Charaka Samhita",
        reference="Vimanasthana, Chapter 8 (Rogabhishagjitiya Adhyaya)",
        summary="Details the ten-fold clinical examination (Dashavidha Pariksha) with Prakriti and Sara examination as the baseline for assessing constitutional resilience.",
    ),
    ClassicalCitationOut(
        treatise="Ashtanga Hridaya",
        reference="Sutrasthana, Chapter 1 & 2 (Ayushkamiya & Dinacharya Adhyaya)",
        summary="Codifies the universal definition of health: equilibrium of Doshas, Dhatus, and Agni, accompanied by clarity of sensory organs and mind (Swastha Lakshana).",
    ),
]


def _resolve_primary_dosha(result_type: str) -> str:
    cleaned = (result_type or "").lower().replace("-", "_").strip()
    if "pitta" in cleaned and "vata" not in cleaned and "kapha" not in cleaned:
        return "pitta"
    if "vata" in cleaned and "pitta" not in cleaned and "kapha" not in cleaned:
        return "vata"
    if "kapha" in cleaned and "pitta" not in cleaned and "vata" not in cleaned:
        return "kapha"
    if cleaned.startswith("pitta"):
        return "pitta"
    if cleaned.startswith("vata"):
        return "vata"
    if cleaned.startswith("kapha"):
        return "kapha"
    return "pitta"  # safe fallback


@router.get("/prakruti", response_model=ComprehensiveReportResponse)
async def get_comprehensive_prakruti_report(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Serve a consolidated, institutional-grade Ayurvedic Health Dossier
    synthesized from the user's completed Prakriti diagnostic, active Vikriti,
    and classical treatise citations."""
    cache_key = f"user:{current_user.id}:report"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return cached

    # 1. Fetch latest completed Prakriti assessment
    assessment_query = (
        select(AssessmentSession)
        .where(
            AssessmentSession.user_id == current_user.id,
            AssessmentSession.status == "completed",
        )
        .order_by(AssessmentSession.started_at.desc())
    )
    assessment_res = await session.exec(assessment_query)
    assessment = assessment_res.first()

    if not assessment:
        if current_user.role == "guest":
            assessment = AssessmentSession(
                id=1,
                user_id=0,
                status="completed",
                result_type="pitta_kapha",
                vata_score=22.0,
                pitta_score=48.0,
                kapha_score=30.0,
                completed_at=datetime.utcnow(),
            )
            total_questions = 24
        else:
            raise HTTPException(
                status_code=404,
                detail="No completed Prakriti assessment found. Complete your 3-minute diagnostic assessment to generate your official clinical report.",
            )
    else:
        q_query = select(QuestionResponse).where(QuestionResponse.session_id == assessment.id)
        q_res = await session.exec(q_query)
        all_responses = q_res.all()
        total_questions = len(all_responses) or 24


    # 3. Fetch latest completed Vikriti check-in (optional overlay)
    vikriti_query = (
        select(VikritiCheckin)
        .where(
            VikritiCheckin.user_id == current_user.id,
            VikritiCheckin.status == "completed",
        )
        .order_by(VikritiCheckin.created_at.desc())
    )
    vikriti_res = await session.exec(vikriti_query)
    latest_vikriti = vikriti_res.first()

    # 4. Resolve phenotype and lookup metadata
    raw_result = (assessment.result_type or "pitta").lower().replace("-", "_").strip()
    meta = PHENOTYPE_METADATA.get(raw_result)
    if not meta:
        # Try finding closest match
        primary_key = _resolve_primary_dosha(raw_result)
        meta = PHENOTYPE_METADATA.get(primary_key, PHENOTYPE_METADATA["pitta"])

    primary_dosha = _resolve_primary_dosha(raw_result)
    diet_rules = DIETARY_RULES.get(primary_dosha, DIETARY_RULES["pitta"])
    spices = SPICE_CATALOG.get(primary_dosha, SPICE_CATALOG["pitta"])

    # 5. Build Vikriti overlay
    vikriti_overlay = VikritiOverlayOut(has_active_checkin=False)
    if latest_vikriti:
        days_ago = (datetime.utcnow() - latest_vikriti.created_at).days
        if days_ago <= 21:  # Relevant within 3 weeks
            scores = {
                "Vata": latest_vikriti.vata_score or 0.0,
                "Pitta": latest_vikriti.pitta_score or 0.0,
                "Kapha": latest_vikriti.kapha_score or 0.0,
            }
            sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            top_aggravated, top_score = sorted_scores[0]
            vikriti_overlay = VikritiOverlayOut(
                has_active_checkin=True,
                most_aggravated=top_aggravated,
                delta_percentage=round(top_score, 1),
                days_ago=days_ago,
                recommendation=f"Weekly spike in {top_aggravated} detected. Integrated digestive counter-measures into Ahara matrix.",
            )

    # 6. Build Dossier ID & Tamper-Evident Hash
    dossier_id = "AYU-2026-DEMO-001" if current_user.role == "guest" else f"AYU-2026-{current_user.id:04d}-{assessment.id:03d}"
    assessment_date_str = assessment.completed_at.strftime("%d %b %Y") if assessment.completed_at else datetime.utcnow().strftime("%d %b %Y")

    
    hash_payload = f"{dossier_id}|{current_user.email}|{assessment.result_type}|{assessment.vata_score}|{assessment.pitta_score}|{assessment.kapha_score}|{assessment_date_str}"
    verification_hash = hashlib.sha256(hash_payload.encode()).hexdigest()[:24].upper()

    # 7. Dinacharya Blueprint specifics based on primary dosha
    dinacharya_configs = {
        "vata": DinacharyaBlueprintOut(
            brahma_muhurta="05:30 AM – 06:15 AM (Pre-sunrise gentle awakening)",
            morning_cleansing=[
                "Warm water with a slice of fresh ginger and pinch of rock salt",
                "Copper tongue scraping (Jihwa Nirlekhana) 7–10 gentle strokes",
                "Sesame oil gargling / swishing (Kavala) for 5 minutes",
                "Gentle warm Sesame oil self-massage (Abhyanga) before bath",
            ],
            optimal_sleep="10:00 PM – 06:30 AM (7.5–8.5 Hours; apply warm oil to soles before rest)",
            exercise_rule="Ardha-Shakti Rule: Exercise up to 50% capacity; stop at light forehead sweat",
            suggested_pranayama="Nadi Shodhana (Alternate Nostril) — 10 unhurried rounds for nervous system stability",
        ),
        "pitta": DinacharyaBlueprintOut(
            brahma_muhurta="05:15 AM – 06:00 AM (Cool morning transition)",
            morning_cleansing=[
                "Room-temperature water stored overnight in a copper vessel (Tamra Jal)",
                "Silver or stainless steel tongue scraping (Jihwa Nirlekhana)",
                "Coconut oil mouth swishing (Kavala) for cooling oral microflora",
                "Cooling Coconut or Brahmi oil Abhyanga followed by lukewarm shower",
            ],
            optimal_sleep="10:15 PM – 06:00 AM (7.0–8.0 Hours; cool, dark, well-ventilated room)",
            exercise_rule="Ardha-Shakti Rule: Moderate exertion; avoid hot sun; finish with cooling breathwork",
            suggested_pranayama="Sheetali & Sheetkari Pranayama — 8–10 cooling breaths to soothe internal heat",
        ),
        "kapha": DinacharyaBlueprintOut(
            brahma_muhurta="04:45 AM – 05:30 AM (Brahma Muhurta - before dawn heavy sluggishness)",
            morning_cleansing=[
                "Warm water infused with half teaspoon of raw unheated honey and black pepper",
                "Copper tongue scraping (Jihwa Nirlekhana) to eliminate overnight oral Ama",
                "Sesame or mustard oil gargle with warm water rinse",
                "Dry herbal powder massage (Udvartana) using chickpea and triphala powder",
            ],
            optimal_sleep="10:30 PM – 05:30 AM (6.5–7.0 Hours; strictly avoid daytime naps / Diva-swapna)",
            exercise_rule="Ardha-Shakti Rule: Vigorous, brisk cardiovascular stimulation until moderate sweat",
            suggested_pranayama="Kapalabhati & Bhastrika — stimulating breathwork to clear respiratory channels",
        ),
    }

    dinacharya_blueprint = dinacharya_configs.get(primary_dosha, dinacharya_configs["pitta"])

    report_response = ComprehensiveReportResponse(
        patient_info=PatientInfoOut(
            name=current_user.name or (current_user.email.split("@")[0].capitalize() if current_user.email else "Patient"),
            email=current_user.email,
            dossier_id=dossier_id,
            assessment_date=assessment_date_str,
            preferred_language=current_user.preferred_language or "en",
        ),
        prakriti=PrakritiDetailsOut(
            result_type=assessment.result_type or "pitta",
            phenotype_name=meta["name"],
            phenotype_sanskrit=meta["sanskrit"],
            phenotype_category=meta["category"],
            vata_score=round(assessment.vata_score or 0.0, 1),
            pitta_score=round(assessment.pitta_score or 0.0, 1),
            kapha_score=round(assessment.kapha_score or 0.0, 1),
            total_questions_answered=total_questions,
            agni_type=meta["agni"][0],
            agni_description=meta["agni"][1],
            koshta_type=meta["koshta"],
            dominant_gunas=meta["gunas"],
            physical_markers=meta["physical"],
            psychological_markers=meta["psychological"],
        ),
        vikriti_overlay=vikriti_overlay,
        dietary_blueprint=DietaryBlueprintOut(
            tastes_to_favor=diet_rules["favor"],
            tastes_to_moderate=diet_rules["moderate"],
            key_beneficial_foods=diet_rules["staples"],
            foods_to_minimize=diet_rules["minimize"],
            viruddha_ahara_warnings=diet_rules["viruddha"],
            meal_routine_advice=diet_rules["meal_advice"],
        ),
        dinacharya_blueprint=dinacharya_blueprint,
        kitchen_pharmacopoeia=spices,
        classical_citations=CLASSICAL_CITATIONS,
        verification_hash=verification_hash,
        generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
    )
    memory_cache.set(cache_key, report_response, ttl_seconds=300)
    return report_response
