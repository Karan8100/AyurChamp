"""RAG Pipeline & Retrieval Verification Script (MVP Step 1B Verification)"""

import asyncio
import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.models import KnowledgeChunk
from app.services.llm_client import embed_text, call_llm
from app.services.retrieval import retrieve_relevant_chunks


async def verify():
    print("=== 1. Testing embed_text() ===")
    sample_text = "Warm nourishing soups with ghee are ideal for pacifying Vata."
    vec = await embed_text(sample_text)
    print(f"Embedding generated: length = {len(vec)}, sample values = {vec[:3]}...")
    assert len(vec) == 1536, f"Expected 1536 dimension, got {len(vec)}"
    print("PASS: embed_text() returns correct 1536-dimensional vector.\n")

    print("=== 2. Testing retrieve_relevant_chunks() - Query: 'What foods pacify Vata dosha?' ===")
    results = await retrieve_relevant_chunks("What foods pacify Vata dosha?", k=3)
    print(f"Retrieved {len(results)} chunks:")
    for i, r in enumerate(results, 1):
        print(f"  [{i}] Source: {r.source} | Category: {r.category}\n      Content: {r.content[:80]}...")
    
    assert len(results) > 0, "Expected at least 1 retrieved chunk"
    assert "vata" in results[0].source or "diet" in results[0].category, "Expected top result to match Vata diet"
    print("PASS: Top retrieved chunk is relevant to Vata diet.\n")

    print("=== 3. Testing retrieve_relevant_chunks() with Category Filter ===")
    lifestyle_results = await retrieve_relevant_chunks("monsoon regimen", k=2, category="lifestyle")
    print(f"Retrieved {len(lifestyle_results)} lifestyle chunks:")
    for i, r in enumerate(lifestyle_results, 1):
        print(f"  [{i}] Source: {r.source} | Category: {r.category}\n      Content: {r.content[:80]}...")
        assert r.category == "lifestyle", f"Expected category 'lifestyle', got '{r.category}'"
    print("PASS: Category filtering works correctly.\n")

    print("=== 4. Testing call_llm() ===")
    fast_response = await call_llm("Summarize Ayurvedic Vata diet", model_tier="fast")
    print(f"Fast LLM call output: {fast_response[:100]}...")
    quality_response = await call_llm("Deep analysis of Dosha imbalances", model_tier="quality")
    print(f"Quality LLM call output: {quality_response[:100]}...")
    print("PASS: call_llm() executed cleanly across fast and quality model tiers.\n")

    print("=== ALL STEP-1B VERIFICATION CHECKS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    asyncio.run(verify())
