"""Vikriti Assessment & Dynamic Diet Overlay Test Script (MVP Step 2)"""

import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from sqlmodel import SQLModel, select
from app.db.session import async_session, engine
from app.models import AssessmentSession, User, VikritiCheckin, VikritiResponse
from app.data.vikriti_questions import VIKRITI_QUESTIONS, compute_aggravation, most_aggravated
from app.services.prakriti_scoring import compute_scores
from app.services.diet_plan import generate_diet_plan
from app.services.ritucharya import get_current_ritu


async def run_tests():
    print("=== 1. Checking Database Tables for VikritiCheckin & VikritiResponse ===")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("PASS: Vikriti tables ensured in DB.\n")

    print("=== 2. Testing Aggravation & Most Aggravated Logic ===")
    # Suppose user's Prakriti is Vata-dominant (Vata 50%, Pitta 30%, Kapha 20%)
    prakriti_baseline = {"vata": 50.0, "pitta": 30.0, "kapha": 20.0}
    # This week user answers 6 Pitta options, 2 Vata, 2 Kapha
    # Vikriti scores: Pitta = 60%, Vata = 20%, Kapha = 20%
    vikriti_current = {"pitta": 60.0, "vata": 20.0, "kapha": 20.0}
    
    deltas = compute_aggravation(prakriti_baseline, vikriti_current)
    print(f"Aggravation deltas: {deltas}")
    # Pitta delta should be +30, Vata delta -30, Kapha delta 0
    assert deltas["pitta"] == 30.0, f"Expected pitta delta 30.0, got {deltas['pitta']}"
    assert deltas["vata"] == -30.0, f"Expected vata delta -30.0, got {deltas['vata']}"
    
    elevated = most_aggravated(deltas)
    print(f"Most aggravated: {elevated}")
    assert elevated == "pitta", f"Expected 'pitta', got '{elevated}'"
    print("PASS: Delta calculation correctly detects dosha elevated relative to baseline.\n")

    print("=== 3. Testing generate_diet_plan() with Vikriti Overlay ===")
    ritu = get_current_ritu(datetime.now().date())
    
    # Test A: No Vikriti
    plan_no_vikriti = generate_diet_plan("vata", ritu, latest_vikriti=None)
    assert plan_no_vikriti["vikriti"] is None, "Expected vikriti to be None"
    print("PASS: Plan without Vikriti has vikriti=None.")

    # Test B: Fresh Vikriti (e.g. 2 days ago, Pitta elevated)
    fresh_vikriti = {
        "most_aggravated": "pitta",
        "days_ago": 2,
        "created_at": datetime.utcnow() - timedelta(days=2),
        "vata_delta": -30.0,
        "pitta_delta": 30.0,
        "kapha_delta": 0.0,
        "is_stale": False,
    }
    plan_with_vikriti = generate_diet_plan("vata", ritu, latest_vikriti=fresh_vikriti)
    assert plan_with_vikriti["vikriti"] is not None
    assert plan_with_vikriti["vikriti"]["most_aggravated"] == "pitta"
    assert "cooling" in plan_with_vikriti["vikriti"]["tip"].lower()
    print(f"Fresh Vikriti Banner Tip: {plan_with_vikriti['vikriti']['tip']}")
    print("PASS: Fresh Vikriti generates top-level overlay with correct Pitta tip.")

    # Test C: Stale Vikriti (14 days ago)
    stale_vikriti = {
        "most_aggravated": "pitta",
        "days_ago": 14,
        "created_at": datetime.utcnow() - timedelta(days=14),
        "vata_delta": -30.0,
        "pitta_delta": 30.0,
        "kapha_delta": 0.0,
        "is_stale": True,
    }
    plan_stale_vikriti = generate_diet_plan("vata", ritu, latest_vikriti=stale_vikriti)
    assert plan_stale_vikriti["vikriti"] is None, "Expected stale vikriti to not show overlay banner"
    print("PASS: Stale Vikriti (>10 days) suppresses the weekly banner.\n")

    print("=== ALL STEP 2 BACKEND VERIFICATION CHECKS PASSED! ===")


if __name__ == "__main__":
    asyncio.run(run_tests())
