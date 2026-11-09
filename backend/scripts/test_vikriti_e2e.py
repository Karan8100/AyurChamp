"""Full End-to-End Test for MVP Step 2 (Vikriti + Diet Dynamic Layer)"""

import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from sqlmodel import select
from app.db.session import async_session
from app.models import AssessmentSession, User, VikritiCheckin, VikritiResponse
from app.data.vikriti_questions import VIKRITI_QUESTIONS
from app.routers.vikriti import start_vikriti, submit_vikriti_answer, get_latest_vikriti
from app.routers.diet import get_diet_plan
from app.schemas import VikritiAnswerIn


async def test_e2e():
    async with async_session() as session:
        # 1. Setup or fetch a test user
        user_res = await session.exec(select(User).limit(1))
        user = user_res.first()
        if not user:
            user = User(email="test_vikriti@ayushya.local", name="Ayurveda Tester")
            session.add(user)
            await session.commit()
            await session.refresh(user)

        # 2. Ensure user has a completed Prakriti baseline assessment
        prakriti_res = await session.exec(
            select(AssessmentSession).where(
                AssessmentSession.user_id == user.id,
                AssessmentSession.status == "completed",
            )
        )
        prakriti = prakriti_res.first()
        if not prakriti:
            prakriti = AssessmentSession(
                user_id=user.id,
                status="completed",
                result_type="vata",
                vata_score=50.0,
                pitta_score=30.0,
                kapha_score=20.0,
            )
            session.add(prakriti)
            await session.commit()
            await session.refresh(prakriti)

        print(f"Test User ID: {user.id} | Baseline Prakriti: {prakriti.result_type} (V:{prakriti.vata_score}, P:{prakriti.pitta_score}, K:{prakriti.kapha_score})")

        # 3. Check initial check-in count
        initial_checkins_res = await session.exec(
            select(VikritiCheckin).where(VikritiCheckin.user_id == user.id)
        )
        initial_count = len(initial_checkins_res.all())

        # 4. Start Vikriti check-in
        start_out = await start_vikriti(current_user=user, session=session)
        checkin_id = start_out.checkin_id
        print(f"Step A: Started check-in #{checkin_id}, first question: {start_out.question.id}")

        # 5. Answer questions 1 through 9 with Pitta-dominant answers
        for i, q in enumerate(VIKRITI_QUESTIONS[:9]):
            ans_payload = VikritiAnswerIn(
                question_id=q["id"],
                selected_dosha="pitta" if i < 7 else "vata",
            )
            out = await submit_vikriti_answer(
                payload=ans_payload,
                checkin_id=checkin_id,
                current_user=user,
                session=session,
            )
            assert out.status == "in_progress", f"Expected in_progress at question {i+1}"
            print(f"  Answered {q['id']} -> next is {out.next_question.id}")

        # 6. Answer 10th question (completes check-in)
        final_q = VIKRITI_QUESTIONS[9]
        final_out = await submit_vikriti_answer(
            payload=VikritiAnswerIn(question_id=final_q["id"], selected_dosha="pitta"),
            checkin_id=checkin_id,
            current_user=user,
            session=session,
        )
        assert final_out.status == "completed", "Expected status to be completed"
        res = final_out.result
        print(f"\nStep B: Completed check-in #{checkin_id}!")
        print(f"  Scores: Vata {res.vata_score}%, Pitta {res.pitta_score}%, Kapha {res.kapha_score}%")
        print(f"  Deltas: Vata {res.vata_delta}%, Pitta {res.pitta_delta}%, Kapha {res.kapha_delta}%")
        print(f"  Most elevated dosha: {res.most_aggravated}")
        assert res.most_aggravated == "pitta", f"Expected Pitta to be most elevated, got {res.most_aggravated}"

        # 7. Test /vikriti/latest
        latest = await get_latest_vikriti(current_user=user, session=session)
        assert latest is not None
        assert latest.checkin_id == checkin_id
        assert latest.is_stale is False
        print("PASS: /vikriti/latest returns fresh check-in.")

        # 8. Test /diet-plan integration
        diet_plan = await get_diet_plan(current_user=user, session=session)
        assert diet_plan["has_vikriti"] is True
        assert diet_plan["vikriti"] is not None
        assert diet_plan["vikriti"]["most_aggravated"] == "pitta"
        print(f"PASS: /diet-plan includes weekly banner: '{diet_plan['vikriti']['tip'][:60]}...'")

        # 9. Test Stale Check-in (>10 days backdated)
        all_user_checkins = await session.exec(
            select(VikritiCheckin).where(VikritiCheckin.user_id == user.id)
        )
        for c in all_user_checkins.all():
            c.created_at = datetime.utcnow() - timedelta(days=12)
            session.add(c)
        await session.commit()

        stale_diet_plan = await get_diet_plan(current_user=user, session=session)
        assert stale_diet_plan["has_vikriti"] is False, "Expected has_vikriti to be False for stale checkin"
        assert stale_diet_plan["vikriti_stale"] is True, "Expected vikriti_stale to be True"
        assert stale_diet_plan["vikriti"] is None, "Expected vikriti overlay to be None when stale"
        print("PASS: Stale check-in (>10 days) hides banner and sets vikriti_stale=True.")

        # 10. Test Retaking Check-in creates a NEW row (doesn't overwrite)
        second_start = await start_vikriti(current_user=user, session=session)
        second_id = second_start.checkin_id
        assert second_id != checkin_id, f"Expected distinct checkin ID, got {second_id} vs {checkin_id}"

        # Complete second check-in with Kapha
        for q in VIKRITI_QUESTIONS:
            ans = await submit_vikriti_answer(
                payload=VikritiAnswerIn(question_id=q["id"], selected_dosha="kapha"),
                checkin_id=second_id,
                current_user=user,
                session=session,
            )

        all_checkins_res = await session.exec(
            select(VikritiCheckin).where(VikritiCheckin.user_id == user.id)
        )
        total_checkins = len(all_checkins_res.all())
        print(f"PASS: Retaking check-in added new row. Total check-ins for user: {total_checkins} (was {initial_count}).")

        print("\n=======================================================")
        print("  ALL 10 STEP 2 E2E CRITICAL REQUIREMENTS FULLY PASSED!")
        print("=======================================================")


if __name__ == "__main__":
    asyncio.run(test_e2e())
