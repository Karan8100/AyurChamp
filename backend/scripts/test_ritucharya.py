"""Quick unit test for Ritucharya content, schemas, and router."""
from app.data.ritucharya_content import get_all_seasons_data, get_season_by_id
from app.schemas import SeasonDetail, RitucharyaResponse
from app.services.ritucharya import get_current_ritu

# 1. Verify all 6 seasons load
seasons = get_all_seasons_data()
assert len(seasons) == 6, f"Expected 6 seasons, got {len(seasons)}"
season_ids = [s["id"] for s in seasons]
print("Loaded seasons:", season_ids)
assert "varsha" in season_ids
assert "sharad" in season_ids
assert "hemant" in season_ids
assert "shishir" in season_ids
assert "vasant" in season_ids
assert "grishma" in season_ids

# 2. Verify Pydantic schema parsing
parsed_seasons = [SeasonDetail(**s) for s in seasons]
assert len(parsed_seasons) == 6
print("Pydantic SeasonDetail parsing successful!")

# 3. Check season detection
from datetime import date
varsha_sample = get_current_ritu(date(2026, 9, 6))
assert varsha_sample["ritu"] == "varsha", f"Expected varsha for September 6, got {varsha_sample['ritu']}"

current_ritu = get_current_ritu()
print("Current Ritu:", current_ritu)
assert current_ritu["ritu"] in ["varsha", "sharad", "hemant", "shishir", "vasant", "grishma"]

# 4. Verify no medicalized or procedure language
forbidden_terms = [
    "basti", "virechana", "vamana", "enema", "purgation",
    "high vulnerability", "clinical caution", "advisory", "diagnosis",
    "padamshika krama"
]

for s in seasons:
    text_content = str(s).lower()
    for term in forbidden_terms:
        assert term not in text_content, f"Found forbidden term '{term}' in season {s['id']}"

print("All safety and authenticity constraints verified!")
print("ALL RITUCHARYA UNIT TESTS PASSED!")
