"""E2E API test for /recommendations/lifestyle."""
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token

async def test_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Unauthenticated -> 401
        res_no_auth = await client.get("/recommendations/lifestyle")
        assert res_no_auth.status_code == 401, f"Expected 401, got {res_no_auth.status_code}"
        print("PASS: Unauthenticated request correctly returns 401!")

        # 2. Authenticated user (user id 1 has completed assessment)
        token = create_access_token(user_id=1, role="user")
        headers = {"Authorization": f"Bearer {token}"}
        res_auth = await client.get("/recommendations/lifestyle", headers=headers)
        assert res_auth.status_code == 200, f"Expected 200, got {res_auth.status_code}: {res_auth.text}"
        data = res_auth.json()

        print(f"PASS: /recommendations/lifestyle returned 200 for user 1 (Dosha: {data['dosha']})")
        assert "sleep_guide" in data
        assert "exercise_guide" in data
        assert "pranayama_guide" in data
        assert len(data["daily_timeline"]) == 4

        # Check Gandusha/Kavala in timeline
        morning_rituals = " ".join(data["daily_timeline"][0]["rituals"])
        assert "Gandusha" in morning_rituals and "Kavala" in morning_rituals
        print("PASS: Gandusha and Kavala precision verified in API response!")

        # Check chapter ref
        assert "Ashtanga Hridaya" in data["chapter_ref"]
        print("PASS: Classical chapter reference verified!")

        print("\nALL RECOMMENDATIONS API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_api())
