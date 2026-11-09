"""Unit and schema tests for Dinacharya and Lifestyle recommendations."""
from app.data.dinacharya_content import get_lifestyle_recommendations
from app.schemas import LifestyleRecommendationResponse

ritu = {
    "ritu": "varsha",
    "sanskrit_name": "Varsha Ritu",
    "english_name": "Monsoon",
    "months": "July – September",
}

# 1. Baseline Test (Vata, no Vikriti)
plan_vata = get_lifestyle_recommendations("vata", ritu, None)
assert plan_vata["dosha"] == "Vata"
assert not plan_vata["has_vikriti"]
assert plan_vata["weekly_banner"] is None
assert "7.5" in plan_vata["sleep_guide"]["duration_hours"]
assert len(plan_vata["daily_timeline"]) == 4

# Check Gandusha / Kavala precision in morning timeline
morning = plan_vata["daily_timeline"][0]
morning_text = " ".join(morning["rituals"])
assert "Gandusha" in morning_text and "Kavala" in morning_text
print("PASS: Gandusha and Kavala precision verified in morning timeline!")

# 2. Pitta with active Vikriti (Pitta elevated)
vikriti_pitta = {
    "most_aggravated": "pitta",
    "is_stale": False,
    "days_ago": 2,
    "vata_delta": -10,
    "pitta_delta": 45,
    "kapha_delta": -20,
}
plan_pitta_vikriti = get_lifestyle_recommendations("pitta", ritu, vikriti_pitta)
assert plan_pitta_vikriti["has_vikriti"]
assert plan_pitta_vikriti["weekly_banner"] is not None
assert "cool" in plan_pitta_vikriti["sleep_guide"]["weekly_adaptation"].lower()
assert "sheetali" in plan_pitta_vikriti["pranayama_guide"]["weekly_adaptation"].lower()
print("PASS: Pitta Vikriti dynamic lifestyle adaptations verified!")

# 3. Kapha with Kapalabhati / Bhastrika contraindication check
plan_kapha = get_lifestyle_recommendations("kapha", ritu, None)
contra = plan_kapha["pranayama_guide"].get("contraindication")
assert contra is not None
assert "pregnant" in contra.lower()
assert "heart condition" in contra.lower() or "high blood pressure" in contra.lower()
print(f"PASS: Kapha breathwork contraindication verified: '{contra}'")

# 4. Pydantic schema validation
parsed = LifestyleRecommendationResponse(**plan_pitta_vikriti)
assert parsed.dosha == "Pitta"
print("PASS: Pydantic LifestyleRecommendationResponse schema validation successful!")

print("\nALL LIFESTYLE RECOMMENDATIONS TESTS PASSED SUCCESSFULLY!")
