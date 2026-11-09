"""Classical Ayurvedic Daily Routine (Dinacharya) & Lifestyle Knowledge Base.

Sources:
- Ashtanga Hridaya, Sutrasthana Chapter 2 (Dinacharya Adhyaya)
- Charaka Samhita, Sutrasthana Chapter 5 (Matrashitiya Adhyaya)

Structured for clear educational guidance, respectful of clinical boundaries:
- Zero unsupervised medical procedures
- Precise terminology (Gandusha vs. Kavala, Ardha-Shakti, Brahma Muhurta)
- Clear contraindication warnings for vigorous breathwork
"""

import copy
from typing import Any, Dict, List, Optional


LIFESTYLE_FOUNDATION: Dict[str, Dict[str, Any]] = {
    "vata": {
        "sleep": {
            "duration_hours": "7.5 – 8.5 Hours",
            "recommended_window": "10:00 PM – 6:30 AM",
            "temperament": "Light, variable sleeper prone to waking between 2:00 AM – 4:00 AM if overstimulated or anxious.",
            "bedtime_ritual": [
                "Dim artificial lights and disconnect from screens by 9:00 PM",
                "Warm foot massage (Pada Abhyanga) with warm sesame oil before resting",
                "Sip a small cup of warm spiced milk with nutmeg and green cardamom",
                "Keep the bedroom comfortably warm, quiet, and protected from drafts",
            ],
        },
        "exercise": {
            "intensity_level": "Gentle to Moderate (Ardha-Shakti)",
            "intensity_meaning": "Exercise only up to half of personal capacity; cease when light perspiration appears on forehead and breathing remains rhythmic.",
            "recommended_modalities": [
                "Restorative and grounding Hatha Yoga",
                "Slow, mindful Surya Namaskar (Sun Salutations)",
                "Gentle walking in tranquil nature or parks",
                "Joint rotations and gentle stretching (Sukshma Vyayama)",
            ],
            "optimal_time": "Early morning (7:00 AM – 8:30 AM) or sunset twilight (5:00 PM – 6:00 PM)",
        },
        "pranayama": {
            "technique_name": "Nadi Shodhana (Alternate Nostril Breathing)",
            "technique_sanskrit": "नाड़ी शोधन प्राणायाम",
            "description": "A deeply balancing and grounding breathwork practice that harmonizes the right and left brain hemispheres, steadying the nervous system.",
            "steps": [
                "Sit comfortably with your spine erect and shoulders relaxed",
                "Use the right thumb to gently close the right nostril and inhale deeply through the left",
                "Close the left nostril with your ring finger, release the right, and exhale smoothly",
                "Inhale through the right nostril, close it, and exhale through the left to complete one round",
            ],
            "duration": "5 to 10 minutes (approx. 10–12 unhurried cycles)",
            "contraindication": None,
        },
    },
    "pitta": {
        "sleep": {
            "duration_hours": "7.0 – 8.0 Hours",
            "recommended_window": "10:15 PM – 6:00 AM",
            "temperament": "Sound, moderate sleeper prone to postponing sleep for late-night problem solving or reading.",
            "bedtime_ritual": [
                "Step away from intense work discussions or bright blue screens by 9:30 PM",
                "Keep the bedroom well-ventilated, cool, and dark",
                "Apply a dab of cooling rose water or pure sandalwood oil to the temples and wrists",
                "Read calming, contemplative literature rather than stimulating thrillers",
            ],
        },
        "exercise": {
            "intensity_level": "Moderate & Non-Competitive (Ardha-Shakti)",
            "intensity_meaning": "Avoid pushing to exhaustive burnout or intense aggression; keep movement joyful and physically centered.",
            "recommended_modalities": [
                "Cooling Moon Salutations (Chandra Namaskar)",
                "Gentle swimming in pleasant, temperate water",
                "Brisk evening walks in cool twilight or moonlight",
                "Flowing Vinyasa yoga practiced in a well-ventilated, unheated room",
            ],
            "optimal_time": "Early morning before the sun reaches peak heat (6:00 AM – 7:30 AM) or cool dusk",
        },
        "pranayama": {
            "technique_name": "Sheetali / Sheetkari (Cooling Breath)",
            "technique_sanskrit": "शीतली प्राणायाम",
            "description": "A classical cooling breathing practice that draws soothing air across the tongue, pacifying internal metabolic heat and calming mental tension.",
            "steps": [
                "Sit comfortably with your back straight and eyes gently closed",
                "Roll the tongue into a tube (or gently separate lips with teeth touching for Sheetkari)",
                "Inhale slowly and deeply through the curled tongue, feeling the cool draft",
                "Close the mouth and exhale smoothly through both nostrils",
            ],
            "duration": "5 to 8 minutes (approx. 12–15 slow cooling breaths)",
            "contraindication": "Avoid during severe cold, winter frost, or if experiencing acute throat infection.",
        },
    },
    "kapha": {
        "sleep": {
            "duration_hours": "6.0 – 7.0 Hours",
            "recommended_window": "10:00 PM – 5:30 AM",
            "temperament": "Deep, heavy sleeper prone to morning grogginess and oversleeping past sunrise if not awakened by an alarm.",
            "bedtime_ritual": [
                "Eat an early, light dinner at least 3 hours before sleep to allow full digestion",
                "Rise promptly upon waking without lounging or lingering in bed",
                "Avoid sleeping during the daytime (Divaswapna), as it directly creates sluggishness",
                "Keep bedding comfortable but not excessively warm or plush",
            ],
        },
        "exercise": {
            "intensity_level": "Active, Dynamic & Energizing",
            "intensity_meaning": "Kapha benefits most from sweat-inducing, stimulating exertion that clears sluggishness and awakens metabolic circulation.",
            "recommended_modalities": [
                "Dynamic, brisk Surya Namaskar (Sun Salutations)",
                "Aerobic movement: jogging, cycling, or brisk incline walking",
                "Dynamic Ashtanga or Power Yoga flows",
                "Rhythmic jumping or skipping to mobilize stagnant lymphatic fluid",
            ],
            "optimal_time": "Morning hours (6:00 AM – 9:00 AM) to break through morning heaviness",
        },
        "pranayama": {
            "technique_name": "Bhastrika / Kapalabhati (Energizing Breath)",
            "technique_sanskrit": "भस्त्रिका प्राणायाम",
            "description": "An invigorating breathwork practice that generates internal warmth, clears sluggish respiratory channels, and sharpens mental focus.",
            "steps": [
                "Sit upright with spine erect and chest comfortably open",
                "Take a deep breath in, then exhale forcefully through the nostrils while pulling the abdomen inward",
                "Allow the inhalation to happen passively, followed immediately by rhythmic, active exhalations",
                "Practice in short cycles of 20–30 breaths, resting with normal breathing between rounds",
            ],
            "duration": "3 to 5 minutes in short, mindful rounds",
            "contraindication": "Avoid vigorous breathing exercises if pregnant, or if you have high blood pressure, vertigo, or a heart condition — consult a healthcare professional first.",
        },
    },
}


# ── The Classical Chronobiological Daily Clock (4 Phases) ─────────────

DAILY_CLOCK_PHASES: List[Dict[str, Any]] = [
    {
        "phase_id": "morning",
        "time_window": "6:00 AM – 10:00 AM",
        "dosha_active": "Kapha Period (Heaviness & Structure)",
        "phase_title": "Awakening, Cleanse & Movement",
        "focus": "Mobilizing energy, clearing overnight metabolic waste, and shaking off morning sluggishness.",
        "rituals": [
            "Wake during Brahma Muhurta (around dawn) when the atmosphere is clearest",
            "Drink 1–2 glasses of warm water (Ushnodaka) to stimulate natural peristalsis",
            "Tongue scraping (Jihwa Nirlekhana) using a copper or stainless steel scraper",
            "Oral oil care (Gandusha: holding warm sesame oil stationary in the mouth, or Kavala: gentle oil swishing) to strengthen gums and oral tissues",
            "Engage in 20–30 minutes of energizing exercise or yoga before breakfast",
        ],
    },
    {
        "phase_id": "midday",
        "time_window": "10:00 AM – 2:00 PM",
        "dosha_active": "Pitta Period (Transformation & Focus)",
        "phase_title": "Peak Digestion & Mental Output",
        "focus": "Sun and internal digestive fire (Agni) are at their zenith; optimal window for the day's primary meal and demanding cognitive work.",
        "rituals": [
            "Eat the most substantial, nutrient-dense meal of the day between 12:00 PM – 1:00 PM",
            "Take a gentle 100-step stroll (Shatapadi) after lunch rather than sitting immediately",
            "Tackle high-priority professional tasks requiring sharp decision making and analytical focus",
            "Avoid intense emotional confrontations or high-stress meetings during peak midday heat",
        ],
    },
    {
        "phase_id": "afternoon",
        "time_window": "2:00 PM – 6:00 PM",
        "dosha_active": "Vata Period (Movement & Creativity)",
        "phase_title": "Creative Flow & Mindful Transition",
        "focus": "Mental agility is high, but physical energy can scatter if ungrounded. Perfect for collaborative work, writing, and gentle hydration.",
        "rituals": [
            "Channel energy into creative thinking, brainstorming, communication, and synthesis",
            "Enjoy a warm cup of herbal tea (tulsi, ginger, or fennel) around 4:00 PM for grounding hydration",
            "Step away from screens for a 5-minute posture reset and deep diaphragmatic breathing",
            "Wind down intense analytical work as 6:00 PM approaches",
        ],
    },
    {
        "phase_id": "evening",
        "time_window": "6:00 PM – 10:00 PM",
        "dosha_active": "Kapha Period (Settling & Rest)",
        "phase_title": "Nourishing Dinner & Sleep Preparation",
        "focus": "Nature transitions to stillness; internal systems prepare for cellular repair. Prioritize relaxation, lightness, and timely rest.",
        "rituals": [
            "Eat a warm, light, freshly cooked dinner before 7:30 PM to allow complete digestion before bed",
            "Practice digital sunset: turn off bright screens and harsh overhead lighting by 9:00 PM",
            "Engage in quiet reading, gentle conversation, or 5–10 minutes of calming pranayama",
            "Retire to bed by 10:00 PM before the midnight Pitta metabolic surge begins",
        ],
    },
]


# ── Weekly Vikriti Dynamic Tweaks ─────────────────────────────────────

VIKRITI_LIFESTYLE_ADAPTATIONS: Dict[str, Dict[str, Any]] = {
    "vata": {
        "banner": "Adapted for elevated Vata this week: Prioritizing grounding nervous-system calm, restorative bedtime rituals, and unhurried movement.",
        "sleep": "Bedtime nervous restlessness elevated: practice warm foot massage (Pada Abhyanga) with warm sesame oil and sip warm spiced milk before bed.",
        "exercise": "Energy easily scattered: temporarily replace high-intensity cardio with slow joint movements, grounding nature walks, and restorative yoga.",
        "pranayama": "Focus on slow, unhurried Nadi Shodhana (Alternate Nostril Breathing) to soothe inner anxiety and ground racing thoughts.",
    },
    "pitta": {
        "banner": "Adapted for elevated Pitta this week: Emphasizing thermal cooling, moderate evening exercise, and soothing nighttime wind-downs.",
        "sleep": "Late-night mental heat elevated: ensure bedroom is cool and well-ventilated, disconnect from screens by 9:30 PM, and apply rose water to temples.",
        "exercise": "Body heat running high: avoid hot midday workouts or competitive pressure; favor cooling evening swimming or relaxed moon salutations.",
        "pranayama": "Prioritize Sheetali / Sheetkari (Cooling Breath) to disperse excess internal heat and soothe irritability.",
    },
    "kapha": {
        "banner": "Adapted for elevated Kapha this week: Prioritizing early morning rising, stimulating movement, and active daytime energy.",
        "sleep": "Morning sluggishness elevated: set a firm wake-up time by 6:00 AM; strictly avoid daytime naps (Divaswapna) to clear heaviness.",
        "exercise": "Circulation feels heavy: add an extra 15–20 minutes of dynamic morning Surya Namaskar or brisk cardio to awaken the metabolism.",
        "pranayama": "Incorporate gentle stimulating breathwork (Bhastrika / Kapalabhati) in the morning to disperse sluggishness and clear breathing channels.",
    },
}


def get_lifestyle_recommendations(
    dosha_result: str,
    ritu: dict,
    latest_vikriti: Optional[dict] = None,
) -> dict:
    """Generate complete lifestyle recommendations based on Prakriti, season,
    and active weekly Vikriti check-in."""

    # 1. Resolve primary dosha
    primary = dosha_result.split("_")[0] if "_" in dosha_result else dosha_result
    if primary == "tridoshic":
        primary = "vata"
    primary = primary.lower()

    foundation = LIFESTYLE_FOUNDATION.get(primary, LIFESTYLE_FOUNDATION["vata"])

    # Deep copy so we don't mutate dictionary across requests
    sleep_guide = copy.deepcopy(foundation["sleep"])
    exercise_guide = copy.deepcopy(foundation["exercise"])
    pranayama_guide = copy.deepcopy(foundation["pranayama"])
    daily_timeline = copy.deepcopy(DAILY_CLOCK_PHASES)

    # 2. Check active Vikriti check-in (<= 10 days)
    has_active_vikriti = latest_vikriti and not latest_vikriti.get("is_stale", False)
    weekly_banner = None

    if has_active_vikriti and latest_vikriti.get("most_aggravated"):
        aggravated = latest_vikriti["most_aggravated"].lower()
        adaptation = VIKRITI_LIFESTYLE_ADAPTATIONS.get(aggravated)
        if adaptation:
            weekly_banner = adaptation["banner"]
            sleep_guide["weekly_adaptation"] = adaptation["sleep"]
            exercise_guide["weekly_adaptation"] = adaptation["exercise"]
            pranayama_guide["weekly_adaptation"] = adaptation["pranayama"]

    # 3. Seasonal note
    season_name = ritu.get("sanskrit_name", "Varsha Ritu")
    seasonal_note = (
        f"During {season_name} ({ritu.get('english_name', 'Monsoon')}), environmental dampness and humidity "
        f"encourage staying warm and dry. Keep workouts indoors or during clear mornings, dry thoroughly after baths, "
        f"and avoid cold drafts while sleeping."
    )

    # Capitalized display dosha
    display_dosha = "Tridoshic" if dosha_result == "tridoshic" else primary.capitalize()

    return {
        "dosha": display_dosha,
        "sleep_guide": sleep_guide,
        "exercise_guide": exercise_guide,
        "pranayama_guide": pranayama_guide,
        "daily_timeline": daily_timeline,
        "seasonal_note": seasonal_note,
        "has_vikriti": bool(has_active_vikriti),
        "weekly_banner": weekly_banner,
        "chapter_ref": "Ashtanga Hridaya, Sutrasthana Chapter 2 (Dinacharya Adhyaya) & Charaka Samhita Sutrasthana Chapter 5",
    }
