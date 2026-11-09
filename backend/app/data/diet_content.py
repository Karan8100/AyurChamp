"""Static, vetted Ayurvedic diet content — version-controlled data file.

Two independent lookup structures:
1. DOSHA_DIET_FOUNDATION — per-dosha meal guidance + food lists
2. RITU_SEASONAL_OVERLAY — per-Ritu seasonal dietary adjustments

Content is grounded in Charaka Samhita (Sutrasthana) dietary principles.
For dual-dominant / tridoshic results, callers should use the top-ranked
dosha for the foundation content. Dual-dosha blending logic is a future
refinement (noted for Step 2+).
"""

DOSHA_DIET_FOUNDATION: dict[str, dict] = {
    "vata": {
        "principle": "Favor warm, oily, grounding, and nourishing foods to balance Vata's cold, dry, and light qualities.",
        "meals": [
            {
                "meal": "Breakfast",
                "name": "Warm Oat & Spiced Apple Bowl",
                "description": "Cooked oats with stewed apples, cinnamon, cardamom, a drizzle of ghee, and soaked almonds. Warm, moist, and grounding — ideal for calming morning Vata.",
            },
            {
                "meal": "Lunch",
                "name": "Sesame Rice with Moong Dal & Sautéed Vegetables",
                "description": "Basmati rice with yellow moong dal, cumin-tempered spinach and carrots, finished with sesame oil and fresh coriander. A wholesome, easily digestible midday meal.",
            },
            {
                "meal": "Dinner",
                "name": "Warm Pumpkin Soup with Chapati",
                "description": "Creamy pumpkin soup seasoned with ginger, turmeric, and black pepper, served alongside soft whole-wheat chapati. Light yet satisfying for evening digestion.",
            },
        ],
        "favor_foods": [
            "Ghee & sesame oil",
            "Cooked whole grains (rice, oats, wheat)",
            "Warm soups & stews",
            "Sweet fruits (bananas, mangoes, grapes)",
            "Root vegetables (sweet potato, beets, carrots)",
            "Warm spices (cinnamon, ginger, cumin)",
            "Nuts & seeds (almonds, walnuts, flax)",
            "Warm milk with turmeric",
        ],
        "reduce_foods": [
            "Raw salads & cold foods",
            "Dry, crunchy snacks (chips, crackers)",
            "Bitter & astringent vegetables (raw kale, broccoli)",
            "Caffeine & carbonated drinks",
            "Beans (except moong dal)",
            "Frozen or leftover foods",
        ],
    },
    "pitta": {
        "principle": "Favor cooling, sweet, bitter, and mildly astringent foods to pacify Pitta's heat, sharpness, and intensity.",
        "meals": [
            {
                "meal": "Breakfast",
                "name": "Coconut Chia Pudding with Fresh Berries",
                "description": "Overnight chia seeds in coconut milk topped with pomegranate, blueberries, and shredded coconut. Naturally cooling and antioxidant-rich.",
            },
            {
                "meal": "Lunch",
                "name": "Cucumber-Mint Rice Bowl with Raita",
                "description": "Fragrant basmati rice with sautéed zucchini, fresh cucumber, mint chutney, and cool yogurt raita. Balances digestive fire without suppressing it.",
            },
            {
                "meal": "Dinner",
                "name": "Ash Gourd & Coriander Khichdi",
                "description": "Gentle one-pot meal of rice, split moong dal, ash gourd, and coriander with minimal spice. Pitta-pacifying and easy on the digestive system.",
            },
        ],
        "favor_foods": [
            "Coconut oil & ghee",
            "Sweet fruits (melons, pears, pomegranate)",
            "Cooling herbs (coriander, mint, fennel)",
            "Bitter greens (kale, arugula, dandelion)",
            "Basmati rice & wheat",
            "Milk, paneer, and fresh yogurt",
            "Cucumber, ash gourd, bottle gourd",
            "Rose water & aloe vera juice",
        ],
        "reduce_foods": [
            "Hot spices (chili, cayenne, mustard seeds)",
            "Sour foods (vinegar, tomatoes, citrus excess)",
            "Fermented foods (kimchi, hard cheese)",
            "Fried & oily foods",
            "Alcohol & coffee",
            "Red meat",
            "Excess salt",
        ],
    },
    "kapha": {
        "principle": "Favor light, dry, warm, and stimulating foods to counteract Kapha's heavy, cold, and moist qualities.",
        "meals": [
            {
                "meal": "Breakfast",
                "name": "Ginger-Turmeric Millet Porridge",
                "description": "Light millet cooked with fresh ginger, turmeric, a pinch of black pepper, and a teaspoon of raw honey (added after cooling). Warming and metabolism-stimulating.",
            },
            {
                "meal": "Lunch",
                "name": "Barley & Roasted Vegetable Bowl",
                "description": "Nutty barley grain bowl with roasted cauliflower, bell peppers, and mustard greens, dressed with a light lemon-ginger vinaigrette. Dry and pungent to balance Kapha.",
            },
            {
                "meal": "Dinner",
                "name": "Spiced Lentil Soup with Steamed Greens",
                "description": "Masoor dal soup with black pepper, cumin, and fenugreek, served alongside steamed bitter gourd or methi leaves. Light, warm, and digestive.",
            },
        ],
        "favor_foods": [
            "Raw honey (in moderation, never heated)",
            "Ginger, black pepper, turmeric",
            "Light grains (barley, millet, buckwheat)",
            "Bitter & pungent vegetables (bitter gourd, radish, mustard greens)",
            "Legumes (lentils, chickpeas)",
            "Warm herbal teas (ginger, tulsi, cinnamon)",
            "Apples, pears, berries",
            "Mustard oil (in small amounts)",
        ],
        "reduce_foods": [
            "Heavy sweets (refined sugar, cakes)",
            "Dairy (especially cold milk, ice cream, cheese)",
            "Oily & fried foods",
            "White rice & wheat in excess",
            "Cold & frozen foods",
            "Bananas, dates, figs",
            "Excess salt & sour foods",
        ],
    },
}


RITU_SEASONAL_OVERLAY: dict[str, dict] = {
    "shishir": {
        "note": "Shishir (Late Winter) sees Kapha gradually accumulating. The body's digestive fire (Agni) is strong — nourish it with warm, heavy, and sweet foods before Kapha fully manifests in spring.",
        "tips": [
            "Include warm, oily foods like ghee-laden dals and root vegetable stews",
            "Drink warm water with ginger throughout the day",
            "Favor sweet, sour, and salty tastes to support Agni",
            "Include warming spices: cinnamon, cardamom, clove",
        ],
        "favor": ["Ghee", "Sesame oil", "Warm milk", "Jaggery", "Root vegetables", "Nuts"],
        "reduce": ["Cold drinks", "Raw salads", "Ice cream", "Frozen foods"],
    },
    "vasant": {
        "note": "Vasant (Spring) releases accumulated Kapha — the body feels heavy, sluggish, and congested. Shift to lighter, drier, bitter, and pungent foods to rekindle Agni and clear Kapha.",
        "tips": [
            "Reduce heavy, oily, and sweet foods that worsen Kapha",
            "Start the day with warm honey-lemon water",
            "Favor bitter greens, barley, and light lentils",
            "Include physical activity to move stagnant Kapha energy",
        ],
        "favor": ["Honey", "Barley", "Bitter greens", "Ginger", "Light lentils", "Mustard oil"],
        "reduce": ["Heavy sweets", "Cheese", "Cold dairy", "Excess wheat", "Oily foods"],
    },
    "grishma": {
        "note": "Grishma (Summer) strongly aggravates Pitta while naturally pacifying Kapha. The body's Agni weakens in intense heat. Favor cooling, hydrating, sweet foods and avoid excess heat-generating meals.",
        "tips": [
            "Stay hydrated with coconut water, buttermilk, and cooling herbal teas",
            "Eat sweet, light, and liquid-rich foods",
            "Avoid excessive spicy, sour, and salty foods",
            "Rose water, sandalwood paste, and moonlight walks are traditionally recommended",
        ],
        "favor": ["Coconut water", "Watermelon", "Cucumber", "Mint", "Fennel seeds", "Sattu drink"],
        "reduce": ["Hot spices", "Fried food", "Alcohol", "Excess salt", "Sour fermented foods"],
    },
    "varsha": {
        "note": "Varsha (Monsoon) aggravates Vata due to cold, damp, and windy conditions. Digestive fire weakens further. Favor warm, light, and easily digestible foods. Avoid raw, heavy, and stale food.",
        "tips": [
            "Cook with warming spices: ginger, cumin, asafoetida (hing)",
            "Prefer freshly cooked meals — avoid leftover or raw food",
            "Include a small amount of honey to counteract dampness",
            "Drink boiled and cooled water, avoid ice-cold beverages",
        ],
        "favor": ["Ginger", "Moong dal", "Old rice", "Warm soups", "Turmeric", "Rock salt"],
        "reduce": ["Raw salads", "Cold milk", "Heavy grains", "Leafy greens (risk of contamination)", "Street food"],
    },
    "sharad": {
        "note": "Sharad (Autumn) aggravates Pitta that accumulated during the rainy season — now released by the returning warmth. Favor sweet, bitter, and cooling foods to pacify lingering heat.",
        "tips": [
            "Favor sweet and bitter tastes — avoid sour and pungent",
            "Include cooling foods: rice, ghee, milk, sugar cane",
            "Moonlight exposure (Chandrika) is traditionally recommended for cooling",
            "Gradually transition from light monsoon fare to more nourishing meals",
        ],
        "favor": ["Ghee", "Amla (Indian gooseberry)", "Rice", "Sweet fruits", "Milk", "Shatavari"],
        "reduce": ["Hot spices", "Sour curd", "Mustard oil", "Heavy fried food", "Excess sesame oil"],
    },
    "hemant": {
        "note": "Hemant (Early Winter) pacifies Vata — the digestive fire is at its strongest. This is the ideal time to eat heavy, nourishing, sweet, sour, and salty foods. Don't suppress appetite.",
        "tips": [
            "Eat generous, nourishing meals — Agni can handle heavy food now",
            "Favor sweet, sour, and salty tastes",
            "Include sesame oil, ghee, and warm milk with spices",
            "Abhyanga (oil massage) with sesame oil is highly recommended",
        ],
        "favor": ["Sesame oil", "Jaggery", "New rice", "Urad dal", "Warm milk", "Dry fruits"],
        "reduce": ["Fasting or skipping meals", "Cold foods", "Light or dry foods", "Excess bitter/astringent taste"],
    },
}


def get_dosha_foundation(dosha: str) -> dict:
    """Return the per-dosha diet foundation content.

    For dual-dominant results like 'vata_pitta', uses the first (dominant) dosha.
    For 'tridoshic', defaults to 'vata' as it's the most variable dosha.
    """
    if dosha in DOSHA_DIET_FOUNDATION:
        return DOSHA_DIET_FOUNDATION[dosha]

    # Dual-dominant: extract primary dosha (first part of 'vata_pitta')
    primary = dosha.split("_")[0] if "_" in dosha else "vata"

    # Tridoshic: default to vata (most variable, benefits most from structure)
    if dosha == "tridoshic":
        primary = "vata"

    return DOSHA_DIET_FOUNDATION.get(primary, DOSHA_DIET_FOUNDATION["vata"])


def get_seasonal_overlay(ritu: str) -> dict:
    """Return the seasonal dietary overlay for the given Ritu."""
    return RITU_SEASONAL_OVERLAY.get(ritu, RITU_SEASONAL_OVERLAY["hemant"])


# ── Aggravation Diet Tips (Step 2 Vikriti Overlay) ─────────────────────
AGGRAVATION_DIET_TIPS = {
    "vata": "Favor warm, moist, grounding foods. Reduce cold, raw, or dry foods. Keep mealtimes regular.",
    "pitta": "Favor cooling, hydrating foods. Reduce spicy, fried, or fermented foods. Don't skip meals.",
    "kapha": "Favor light, warm, spiced foods. Reduce heavy, oily, or sweet foods. Smaller portions help.",
}


def get_aggravation_tip(dosha: str) -> str:
    """Return the diet adjustment tip for the most aggravated dosha."""
    return AGGRAVATION_DIET_TIPS.get(
        dosha.lower(),
        AGGRAVATION_DIET_TIPS["vata"],
    )


# ── Clinical Meal Synthesis (Prakriti Foundation + Vikriti Adjustment) ─
MEAL_ADJUSTMENTS = {
    "pitta": {
        "Breakfast": {
            "name_suffix": "with Cooling Cardamom & Soaked Almonds",
            "weekly_adjustment": "Swapped heating cinnamon and dry fruits for cooling green cardamom and blanched sweet almonds.",
            "desc_tweak": "Prepared with cooling spices (cardamom and fennel) and unctuous cow's ghee to soothe inner heat and prevent mid-morning acidity.",
        },
        "Lunch": {
            "name_suffix": "with Fresh Cilantro & Cooling Ghee",
            "weekly_adjustment": "Swapped pungent mustard and black pepper with cooling fresh cilantro, fennel seeds, and sweet cumin.",
            "desc_tweak": "Features cooling basmati rice and sweet squashes cooked in ghee; avoids green chili, mustard, and fermented curd.",
        },
        "Dinner": {
            "name_suffix": "with Sweet Pumpkin & Zucchini",
            "weekly_adjustment": "Substituted acidic tomatoes and heating nightshades with soothing sweet gourd and coriander broth.",
            "desc_tweak": "Light, mild, and cooling dinner that settles liver and stomach heat for peaceful, untroubled sleep.",
        },
    },
    "vata": {
        "Breakfast": {
            "name_suffix": "with Stewed Dates & Warm Cow's Ghee",
            "weekly_adjustment": "Added extra unctuous cow's ghee and stewed Medjool dates to deeply anchor airy dryness and calm nerves.",
            "desc_tweak": "Rich, warm, and deeply grounding bowl served hot with warming cinnamon and nutmeg to stabilize erratic morning energy.",
        },
        "Lunch": {
            "name_suffix": "with Roasted Root Vegetables & Extra Ghee",
            "weekly_adjustment": "Added grounding sweet potatoes and warming ginger-cumin tadka to steady fluctuating digestive fire (Vishama Agni).",
            "desc_tweak": "Substantial, well-cooked, warm grains and split dal served unctuous with ghee to settle restless nervous tension.",
        },
        "Dinner": {
            "name_suffix": "with Grounding Butternut Puree & Sesame Oil",
            "weekly_adjustment": "Replaced light or dry foods with warm, rich vegetable purees infused with toasted sesame oil.",
            "desc_tweak": "Nourishing, unctuous, and easily digestible warm stew that blankets Vata's cold, dry lightness before bedtime.",
        },
    },
    "kapha": {
        "Breakfast": {
            "name_suffix": "with Fresh Ginger & Warming Spices",
            "weekly_adjustment": "Reduced heavy oats and dairy; infused fresh grated ginger and black pepper to dissolve morning sluggishness.",
            "desc_tweak": "Light, warm, and stimulating breakfast that awakens slow morning metabolism (Manda Agni) without adding heaviness.",
        },
        "Lunch": {
            "name_suffix": "with Pungent Mustard Seed & Bitter Greens",
            "weekly_adjustment": "Minimized oil and ghee; seasoned with black pepper, mustard seeds, and steamed bitter greens to mobilize sluggish lymph.",
            "desc_tweak": "Dry-roasted spices and astringent split pulses that invigorate energy and eliminate post-meal lethargy.",
        },
        "Dinner": {
            "name_suffix": "with Light Clear Vegetable Broth & Black Pepper",
            "weekly_adjustment": "Kept portion small and free of heavy fats or starches; spiced with warming Trikatu to clear nighttime congestion.",
            "desc_tweak": "Very light, clear soup with warming spices consumed early in the evening to prevent morning heaviness and brain fog.",
        },
    },
}


def synthesize_meals(base_meals: list, elevated_dosha: str) -> list:
    """Synthesizes base Prakriti meals with active weekly Vikriti adjustments.

    Applies Samanya-Vishesha Siddhanta: modifies ingredients to pacify the active
    elevated dosha while preserving the constitutional baseline meal structure.
    """
    dosha = elevated_dosha.lower()
    adjustments = MEAL_ADJUSTMENTS.get(dosha)
    if not adjustments:
        return base_meals

    synthesized = []
    for meal in base_meals:
        meal_type = meal.get("meal", "")
        adj = adjustments.get(meal_type)
        if adj:
            synthesized.append({
                "meal": meal_type,
                "name": f"{meal['name'].split(' with ')[0]} {adj['name_suffix']}",
                "description": f"{meal['description']} {adj['desc_tweak']}",
                "weekly_adjustment": adj["weekly_adjustment"],
                "adapted_for": dosha.capitalize(),
            })
        else:
            synthesized.append(meal)

    return synthesized


