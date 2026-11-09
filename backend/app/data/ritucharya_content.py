"""Classical Ayurvedic Six-Season (Shad Ritu) content and metadata.

Source chapter: Charaka Samhita, Sutrasthana Chapter 6 (Tasyashitiya Adhyaya).
All content is structured as educational summaries with gentle wellness framing,
free of unsupervised clinical procedures or medicalized claims.
"""

from typing import Any, Dict, List

SEASONS_DATA: List[Dict[str, Any]] = [
    {
        "id": "varsha",
        "sanskrit_name": "Varsha Ritu",
        "english_name": "Monsoon",
        "hindi_name": "वर्षा ऋतु",
        "months": "July 15 – September 14",
        "solstice": "Visarga Kala (Southern Solstice / Dakshinayana)",
        "solstice_meaning": "The lunar, nourishing cycle begins. Cooling rain and clouds restore environmental moisture, and bodily vitality begins its slow upward rebuilding.",
        "strength_level": "Low to Moderate",
        "agni_state": "Manda (Weakened by moisture & environmental dampness)",
        "overview": "With the arrival of rains, the cold dampness and earth vapours naturally tend to aggravate Vata dosha, while Pitta begins its gradual accumulation. Because humidity weakens digestive fire (Agni), mealtimes are kept light, warm, and freshly cooked.",
        "dosha_dynamics": {
            "chaya": "Pitta",
            "prakopa": "Vata",
            "prashama": None,
        },
        "ahara": {
            "predominant_rasa": [
                "Amla (Sour)",
                "Lavana (Salty)",
                "Madhura (Sweet)",
            ],
            "favor_foods": [
                "Old barley, wheat, and aged rice",
                "Warm moong dal with cumin and asafoetida (hing)",
                "Small amounts of cow's ghee to protect digestion",
                "Boiled and cooled water, sometimes with a touch of honey",
                "Warming herbal infusions (ginger, tulsi, black pepper)",
            ],
            "moderate_foods": [
                "Raw salads and uncooked sprouts",
                "Heavy, oily, or deep-fried snacks",
                "Daytime cold milk and unpasteurized curd",
                "River water and unboiled rainwater",
                "Stale or leftover food from previous days",
            ],
            "water_guidance": "Drink water that has been thoroughly boiled and allowed to cool naturally. Adding a slice of fresh ginger supports gentle digestion.",
        },
        "vihara": {
            "daily_focus": "Preserving internal digestive warmth and avoiding prolonged exposure to wet clothes or damp breezes.",
            "bathing": "Warm water baths are recommended. Rubbing the skin with dry herbal powders (Udvartana) helps dispel dampness.",
            "clothing": "Dry, clean, and light garments that keep the torso warm. A gentle natural incense (dhoop) can be used to keep living spaces dry.",
            "sleep_guidance": "Daytime sleep (Divaswapna) is discouraged as it increases sluggishness and moisture in the channels. Maintain regular nighttime sleep.",
            "exercise_guideline": "Gentle to moderate indoor yoga and stretching. Avoid heavy exertion or getting soaked in cold rain.",
            "ritu_sandhi_note": "Ritu Sandhi (the 14-day junction period between seasons) requires gently tapering the cooling summer routine and introducing warm, cooked foods gradually.",
            "physician_note": "Classically, this season is considered favorable for Panchakarma (therapeutic detox procedures) — these should only be undertaken under the guidance of a qualified Ayurvedic physician, never self-administered.",
        },
        "chapter_ref": "Charaka Samhita, Sutrasthana Chapter 6 (Tasyashitiya Adhyaya)",
    },
    {
        "id": "sharad",
        "sanskrit_name": "Sharad Ritu",
        "english_name": "Autumn",
        "hindi_name": "शरद ऋतु",
        "months": "September 15 – November 14",
        "solstice": "Visarga Kala (Southern Solstice / Dakshinayana)",
        "solstice_meaning": "The sun re-emerges after clouds clear, while lunar energy continues to nourish the earth and moderate human vitality.",
        "strength_level": "Moderate",
        "agni_state": "Gradually Rekindling (Recovering from monsoon dampness)",
        "overview": "As the monsoon clouds part, sudden exposure to the clear autumn sun heats the body, causing the Pitta that accumulated during the rainy season to naturally flare up, while Vata calms down. Sweet and bitter flavors help keep inner heat balanced.",
        "dosha_dynamics": {
            "chaya": None,
            "prakopa": "Pitta",
            "prashama": "Vata",
        },
        "ahara": {
            "predominant_rasa": [
                "Madhura (Sweet)",
                "Tikta (Bitter)",
                "Kashaya (Astringent)",
            ],
            "favor_foods": [
                "Cooling sweet fruits (pomegranate, sweet grapes, amla)",
                "Ghee and clarified butter in moderation",
                "Light basmati rice, barley, and mung dal",
                "Boiled cow's milk infused with cardamom and saffron",
                "Bitter leafy greens and tender cucumbers",
            ],
            "moderate_foods": [
                "Pungent chilis, hot mustard, and raw garlic",
                "Sour curds and heavily fermented items",
                "Excessive salt and heavily fried savories",
                "Heavy sesame oil and spicy pickles",
            ],
            "water_guidance": "Water purified naturally by sunlight during the day and moonlight at night (classically referred to as Hamsodaka) is considered soothing and clear.",
        },
        "vihara": {
            "daily_focus": "Cooling the mind and body naturally without suppressing digestion.",
            "bathing": "Lukewarm or gently cool baths. Applying sandalwood paste or vetiver (khus) water provides soothing comfort.",
            "clothing": "Light, breathable white or pastel cotton clothing that does not trap excess body heat.",
            "sleep_guidance": "Rest under gentle moonlight (Chandrika) in early evening is classically encouraged for its calming lunar effect. Avoid daytime naps.",
            "exercise_guideline": "Moderate exercise, preferably in the cooler morning or evening hours. Gentle Moon Salutations (Chandra Namaskar) and cooling Sheetali pranayama.",
            "ritu_sandhi_note": "During Ritu Sandhi, reduce heavy monsoon spices and smoothly introduce naturally sweet and bitter foods over 14 days.",
            "physician_note": "Classically, this season is considered favorable for Panchakarma (therapeutic detox procedures) — these should only be undertaken under the guidance of a qualified Ayurvedic physician, never self-administered.",
        },
        "chapter_ref": "Charaka Samhita, Sutrasthana Chapter 6 (Tasyashitiya Adhyaya)",
    },
    {
        "id": "hemant",
        "sanskrit_name": "Hemant Ritu",
        "english_name": "Early Winter",
        "hindi_name": "हेमंत ऋतु",
        "months": "November 15 – January 13",
        "solstice": "Visarga Kala (Southern Solstice / Dakshinayana)",
        "solstice_meaning": "Peak lunar strength period. The environment is cool, and the human body attains its highest natural physical vitality and endurance.",
        "strength_level": "Peak / Highest (Uttama Bala)",
        "agni_state": "Tikshna (Strong & Robust Digestive Fire)",
        "overview": "Cold external temperatures cause internal heat to concentrate in the digestive tract, making Agni robust and efficient. With the digestive fire at its peak, the body can easily process rich, nourishing foods to build physical resilience.",
        "dosha_dynamics": {
            "chaya": None,
            "prakopa": None,
            "prashama": "Pitta",
        },
        "ahara": {
            "predominant_rasa": [
                "Madhura (Sweet)",
                "Amla (Sour)",
                "Lavana (Salty)",
            ],
            "favor_foods": [
                "Rich, warm stews and freshly harvested grains (new rice, wheat)",
                "Black gram (urad dal) and wholesome pulses",
                "Sesame seeds, jaggery, nuts, and dry fruits",
                "Warm spiced milk with nutmeg and cinnamon",
                "Generous use of pure cow's ghee and sesame oil",
            ],
            "moderate_foods": [
                "Fasting or skipping meals (empty stomach allows strong Agni to irritate tissues)",
                "Cold drinks, raw salads, and iced desserts",
                "Excessively light or airy dry crackers",
                "Excess pungent or bitter foods in place of nourishing meals",
            ],
            "water_guidance": "Sip warm or hot water throughout the day. It supports continuous digestion and keeps the throat comfortable.",
        },
        "vihara": {
            "daily_focus": "Nourishing tissues, regular exercise, and daily warm oil self-massage.",
            "bathing": "Warm, comfortable baths following a full-body self-massage (Abhyanga) with warm sesame oil.",
            "clothing": "Warm woolen fabrics, thermal layers, and head coverings when venturing into chilly outdoor winds.",
            "sleep_guidance": "Nights are long; retiring early and rising slightly before dawn keeps the mind refreshed.",
            "exercise_guideline": "Ideal season for vigorous physical training and stamina building up to half of one's full capacity (Ardha-Shakti).",
            "ritu_sandhi_note": "Transitioning into Hemant allows a gradual step-up in meal richness and workout intensity across 14 days.",
            "physician_note": "Classically, this season is considered favorable for Panchakarma (therapeutic detox procedures) — these should only be undertaken under the guidance of a qualified Ayurvedic physician, never self-administered.",
        },
        "chapter_ref": "Charaka Samhita, Sutrasthana Chapter 6 (Tasyashitiya Adhyaya)",
    },
    {
        "id": "shishir",
        "sanskrit_name": "Shishir Ritu",
        "english_name": "Late Winter",
        "hindi_name": "शिशिर ऋतु",
        "months": "January 14 – March 13",
        "solstice": "Adana Kala (Northern Solstice / Uttarayana)",
        "solstice_meaning": "The sun begins its northward trajectory. Solar warmth gradually begins drawing moisture and energy from the physical world.",
        "strength_level": "Good to Moderate (Gradually declining from winter peak)",
        "agni_state": "Sama to Tikshna (Well-sustained Digestive Fire)",
        "overview": "Intense dry cold and biting winds characterize late winter. While digestive power remains strong, environmental dryness begins accumulating Kapha inside the body. Warm, nourishing foods and active lifestyle prevent heaviness.",
        "dosha_dynamics": {
            "chaya": "Kapha",
            "prakopa": None,
            "prashama": "Vata",
        },
        "ahara": {
            "predominant_rasa": [
                "Madhura (Sweet)",
                "Amla (Sour)",
                "Lavana (Salty)",
            ],
            "favor_foods": [
                "Hearty grain bowls (wheat, oats, unpolished rice)",
                "Sesame sweets, flax seeds, and warming nuts",
                "Root vegetables, carrots, and beetroot",
                "Ginger-honey water and herbal broths",
                "Cow's ghee and nutrient-dense dals",
            ],
            "moderate_foods": [
                "Cold beverages and refrigerated leftover food",
                "Light, drying salads with zero healthy fats",
                "Excessive astringent or bitter teas on an empty stomach",
            ],
            "water_guidance": "Warm water remains essential. Lukewarm water with a drop of honey in the morning helps clear sluggish mucus.",
        },
        "vihara": {
            "daily_focus": "Staying protected from harsh frost while keeping the body physically active.",
            "bathing": "Warm water bathing; warm oil massage (Abhyanga) remains a premier protective daily ritual.",
            "clothing": "Thick, warm garments that protect the ears, neck, and feet from cold drafts.",
            "sleep_guidance": "Sleep in warm, draft-free rooms. Avoid sleeping during the daytime.",
            "exercise_guideline": "Energetic morning workouts, Surya Namaskar, and brisk walking in morning sunshine.",
            "ritu_sandhi_note": "During Ritu Sandhi leading toward Spring, gradually introduce slightly lighter grains to prepare for Kapha liquefaction.",
            "physician_note": "Classically, this season is considered favorable for Panchakarma (therapeutic detox procedures) — these should only be undertaken under the guidance of a qualified Ayurvedic physician, never self-administered.",
        },
        "chapter_ref": "Charaka Samhita, Sutrasthana Chapter 6 (Tasyashitiya Adhyaya)",
    },
    {
        "id": "vasant",
        "sanskrit_name": "Vasant Ritu",
        "english_name": "Spring",
        "hindi_name": "वसंत ऋतु",
        "months": "March 14 – May 14",
        "solstice": "Adana Kala (Northern Solstice / Uttarayana)",
        "solstice_meaning": "The sun's strength rises. Environmental warmth melts winter snow and awakens nature, while bodily strength enters a moderate phase.",
        "strength_level": "Moderate (Declining toward summer)",
        "agni_state": "Manda (Dampened by melting Kapha)",
        "overview": "The warmth of spring melts the Kapha that accumulated during winter, flooding the body's channels. This dampens digestive fire and often presents as seasonal heaviness, allergies, or morning sluggishness. Light, warming, and bitter tastes restore balance.",
        "dosha_dynamics": {
            "chaya": None,
            "prakopa": "Kapha",
            "prashama": None,
        },
        "ahara": {
            "predominant_rasa": [
                "Katu (Pungent)",
                "Tikta (Bitter)",
                "Kashaya (Astringent)",
            ],
            "favor_foods": [
                "Barley, roasted chickpeas, and aged wheat",
                "Moong dal, red lentils, and bitter gourd (karela)",
                "Warming spices: dry ginger, black pepper, and long pepper (Trikatu)",
                "Raw honey in small amounts (never heated)",
                "Warm herbal teas (tulsi, fennel, dry ginger)",
            ],
            "moderate_foods": [
                "Heavy sweets, pastries, and ice creams",
                "Cold whole milk, paneer, and rich curds",
                "Deep-fried snacks and excessively oily foods",
                "Excessive sweet and sour tastes that increase mucus",
            ],
            "water_guidance": "Drink warm water infused with ginger or boiled with dried coriander seeds to assist the digestive fire.",
        },
        "vihara": {
            "daily_focus": "Dispersing stagnant heaviness, waking early, and engaging in active movement.",
            "bathing": "Warm water baths preceded by vigorous dry herbal powder massage (Udvartana) to improve circulation.",
            "clothing": "Light, comfortable layers suited to changing weather; avoid overly heavy winter coats.",
            "sleep_guidance": "Strictly avoid daytime naps (Divaswapna), which directly provoke Kapha and sinus congestion. Rise early at sunrise.",
            "exercise_guideline": "Active, sweat-inducing exercise such as dynamic yoga, jogging, or cycling to mobilize accumulated winter stores.",
            "ritu_sandhi_note": "In Ritu Sandhi, taper off winter's heavy fats and introduce light, stimulating bitter foods over a two-week period.",
            "physician_note": "Classically, this season is considered favorable for Panchakarma (therapeutic detox procedures) — these should only be undertaken under the guidance of a qualified Ayurvedic physician, never self-administered.",
        },
        "chapter_ref": "Charaka Samhita, Sutrasthana Chapter 6 (Tasyashitiya Adhyaya)",
    },
    {
        "id": "grishma",
        "sanskrit_name": "Grishma Ritu",
        "english_name": "Summer",
        "hindi_name": "ग्रीष्म ऋतु",
        "months": "May 15 – July 14",
        "solstice": "Adana Kala (Northern Solstice / Uttarayana)",
        "solstice_meaning": "Peak solar intensity. The blazing sun and scorching winds absorb moisture from vegetation and human physiology, reducing physical strength.",
        "strength_level": "Low (Alpa Bala)",
        "agni_state": "Manda / Variable (Depleted by extreme ambient heat)",
        "overview": "Intense heat draws out natural fluids and depletes strength, while Vata begins its subtle accumulation and Kapha calms. The body requires cooling, hydrating, sweet, and naturally unctuous foods to maintain hydration and calm inner heat.",
        "dosha_dynamics": {
            "chaya": "Vata",
            "prakopa": None,
            "prashama": "Kapha",
        },
        "ahara": {
            "predominant_rasa": [
                "Madhura (Sweet)",
                "Sheeta (Cooling Quality)",
                "Snigdha (Naturally Unctuous)",
            ],
            "favor_foods": [
                "Naturally sweet and hydrating fruits: watermelon, melons, sweet mangoes",
                "Fresh coconut water, buttermilk with roasted cumin, and cooling sattu",
                "Basmati rice, barley water, and light mung dal soup",
                "Cow's milk boiled with a pinch of cardamom and sugar candy",
                "Cucumber, mint, coriander, and bottle gourd",
            ],
            "moderate_foods": [
                "Pungent red chilis, raw onions, and fiery spices",
                "Excessively salty snacks that dehydrate cells",
                "Sour fermented foods and alcohol",
                "Hot, dry, or hard-to-digest heavy meats",
            ],
            "water_guidance": "Drink water cooled in traditional terracotta pots (matka). Adding vetiver roots (khus) gives a gentle, cooling aroma.",
        },
        "vihara": {
            "daily_focus": "Staying cool, avoiding direct midday sun, and preserving physical energy.",
            "bathing": "Pleasant lukewarm or cool water baths. Gentle application of rose water or sandalwood paste.",
            "clothing": "Loose, ultra-light white cotton or linen fabrics that allow heat dissipation.",
            "sleep_guidance": "Summer is the only season where a short afternoon rest in a cool, shaded room is classically permitted to replenish lost fluids.",
            "exercise_guideline": "Light, non-strenuous movement in early morning or late evening. Avoid exhausting mid-day workouts.",
            "ritu_sandhi_note": "Ritu Sandhi between summer and monsoon requires switching from cooling liquids to warm, light cooked meals to protect digestion.",
            "physician_note": "Classically, this season is considered favorable for Panchakarma (therapeutic detox procedures) — these should only be undertaken under the guidance of a qualified Ayurvedic physician, never self-administered.",
        },
        "chapter_ref": "Charaka Samhita, Sutrasthana Chapter 6 (Tasyashitiya Adhyaya)",
    },
]


def get_all_seasons_data() -> List[Dict[str, Any]]:
    """Return all six classical seasons with complete metadata."""
    return SEASONS_DATA


def get_season_by_id(season_id: str) -> Dict[str, Any]:
    """Look up a specific season by its ID."""
    season_id_clean = season_id.lower().strip()
    for s in SEASONS_DATA:
        if s["id"] == season_id_clean:
            return s
    return SEASONS_DATA[0]
