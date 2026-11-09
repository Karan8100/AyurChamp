"""E2E API test for Ritucharya endpoints."""
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def test_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Public /ritucharya/all
        res_all = await client.get("/ritucharya/all")
        assert res_all.status_code == 200, f"Expected 200, got {res_all.status_code}"
        data_all = res_all.json()
        assert len(data_all["seasons"]) == 6
        assert data_all["current_season_id"] in ["varsha", "sharad", "hemant", "shishir", "vasant", "grishma"]
        print(f"PASS: /ritucharya/all returns 6 seasons + current_season_id='{data_all['current_season_id']}'")

        # 2. /ritucharya/details without auth (graceful fallback)
        res_details = await client.get("/ritucharya/details")
        assert res_details.status_code == 200, f"Expected 200, got {res_details.status_code}"
        data_details = res_details.json()
        assert data_details["current_season_id"] == data_all["current_season_id"]
        assert len(data_details["seasons"]) == 6
        assert data_details["user_focus"] is None
        print("PASS: /ritucharya/details returns 200 without token (graceful fallback)")

        # Verify season structure on varsha
        varsha = next(s for s in data_details["seasons"] if s["id"] == "varsha")
        assert varsha["sanskrit_name"] == "Varsha Ritu"
        assert varsha["dosha_dynamics"]["prakopa"] == "Vata"
        assert varsha["dosha_dynamics"]["chaya"] == "Pitta"
        assert "Amla (Sour)" in varsha["ahara"]["predominant_rasa"]
        assert "Charaka Samhita" in varsha["chapter_ref"]
        print("PASS: Varsha Ritu structure verified!")

        print("\nALL RITUCHARYA API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
