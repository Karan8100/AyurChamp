"""Diet plan generator — forward-compatible for future RAG/LLM swap.

Architecture:
- "Gather context" (user's dosha result + current Ritu) happens in the
  router, NOT here.
- "Generate content" happens here. Currently a static lookup. When
  swapped for a RAG-based call later, ONLY the inside of
  `generate_diet_plan` should need to change — the function signature,
  the response shape, and everything that calls it stay identical.
"""

from typing import Optional

from app.data.diet_content import (
    get_aggravation_tip,
    get_dosha_foundation,
    get_seasonal_overlay,
    synthesize_meals,
)


def generate_diet_plan(
    dosha_result: str,
    ritu: dict,
    latest_vikriti: Optional[dict] = None,
) -> dict:
    """Generate a complete diet plan response from the user's dosha result
    and the current Ritu.

    Args:
        dosha_result: The user's Prakriti result_type (e.g. "vata", "pitta_kapha", "tridoshic")
        ritu: Dict from get_current_ritu() with keys: ritu, sanskrit_name, english_name, etc.

    Returns:
        Dict matching the DietPlanResponse schema shape.
    """
    foundation = get_dosha_foundation(dosha_result)
    overlay = get_seasonal_overlay(ritu["ritu"])

    # Dynamically synthesize meals based on active Vikriti if valid/fresh
    has_active_vikriti = latest_vikriti and not latest_vikriti.get("is_stale", False)
    if has_active_vikriti and latest_vikriti.get("most_aggravated"):
        meals = synthesize_meals(foundation["meals"], latest_vikriti["most_aggravated"])
    else:
        meals = foundation["meals"]

    # Resolve the display dosha name for UI (capitalize primary dosha)
    if dosha_result == "tridoshic":
        display_dosha = "Tridoshic (Vata-focused)"
    elif "_" in dosha_result:
        parts = dosha_result.split("_")
        display_dosha = "-".join(p.capitalize() for p in parts)
    else:
        display_dosha = dosha_result.capitalize()

    return {
        "dosha": display_dosha,
        "dosha_principle": foundation["principle"],
        "meals": meals,
        "favor_foods": foundation["favor_foods"],
        "reduce_foods": foundation["reduce_foods"],
        "ritu": {
            "ritu": ritu["ritu"],
            "sanskrit_name": ritu["sanskrit_name"],
            "english_name": ritu["english_name"],
            "months": ritu["months"],
            "aggravates": ritu.get("aggravates"),
            "pacifies": ritu.get("pacifies"),
        },
        "seasonal": {
            "note": overlay["note"],
            "tips": overlay["tips"],
            "favor": overlay["favor"],
            "reduce": overlay["reduce"],
        },
        "vikriti": (
            {
                "most_aggravated": latest_vikriti["most_aggravated"],
                "tip": get_aggravation_tip(latest_vikriti["most_aggravated"]),
                "days_ago": latest_vikriti.get("days_ago", 0),
                "created_at": latest_vikriti["created_at"],
                "vata_delta": latest_vikriti.get("vata_delta", 0.0),
                "pitta_delta": latest_vikriti.get("pitta_delta", 0.0),
                "kapha_delta": latest_vikriti.get("kapha_delta", 0.0),
            }
            if latest_vikriti and not latest_vikriti.get("is_stale", False)
            else None
        ),
    }

