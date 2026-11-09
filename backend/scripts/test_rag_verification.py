import asyncio
import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from app.services.llm_client import embed_text
from app.services.retrieval import retrieve_relevant_chunks
from app.services.ayurbot import generate_ayurbot_response
from app.db.session import async_session
from app.models import KnowledgeChunk, User
from sqlmodel import select


async def verify():
    print("=== 1. Testing Live Semantic Vector Retrieval ===")
    test_queries = [
        "Why should curd be avoided at night?",
        "Ashwagandha for high stress and Vata sleep issues",
        "Acidity and burning sensation in stomach remedies",
    ]
    async with async_session() as session:
        for q in test_queries:
            chunks = await retrieve_relevant_chunks(q, k=2, session=session)
            print(f"\nQuery: '{q}'")
            for i, c in enumerate(chunks):
                first_line = c.content.split('\n')[0]
                print(f"  Match {i+1} [{c.category} | {c.source}]: {first_line}")

        print("\n=== 2. Testing End-to-End generate_ayurbot_response with Personal Context & Guardrails ===")
        # Get an existing user or create a temporary mock user object
        user_res = await session.exec(select(User).limit(1))
        user = user_res.first()
        if not user:
            user = User(id=1, name="Test Patient", email="patient@test.com")

        user_query = "Can I eat curd at night if I add black pepper, and what can I take for my burning acidity?"
        print(f"User Query: {user_query}")
        
        response = await generate_ayurbot_response(
            query=user_query,
            user=user,
            session=session,
            language="en"
        )

        print("\nAyurBot Result:")
        print(f"Disclaimers: {response.safety_disclaimer}")
        print(f"Clinical Context Injected: {response.clinical_context}")
        print(f"Citations Found ({len(response.citations)}):")
        for cit in response.citations:
            print(f"  * Source: {cit.source}")
            print(f"    Snippet: {cit.content_snippet[:120]}...")
        print("\nAnswer Content:\n", response.answer)


if __name__ == "__main__":
    asyncio.run(verify())
