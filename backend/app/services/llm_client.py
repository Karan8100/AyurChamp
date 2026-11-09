import hashlib
import json
import logging
import math
import os
from typing import AsyncGenerator, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def _generate_mock_embedding(text: str, dimension: int = 1536) -> List[float]:
    """Generates a deterministic, normalized embedding vector for tests/dev without API keys."""
    # Seed with SHA256 of the text
    hash_bytes = hashlib.sha256(text.encode("utf-8")).digest()
    
    # Generate pseudo-random float values from hash bytes
    raw_vec: List[float] = []
    for i in range(dimension):
        b = hash_bytes[i % len(hash_bytes)]
        offset = (i * 31 + b) % 256
        # Generate value between -1.0 and 1.0
        val = (offset / 127.5) - 1.0
        raw_vec.append(val)
        
    # Also add keyword/word presence signals to make related text have higher cosine similarity
    words = set(text.lower().split())
    for word in words:
        w_hash = hashlib.md5(word.encode("utf-8")).digest()
        idx = int.from_bytes(w_hash[:2], byteorder="big") % dimension
        raw_vec[idx] += 2.0

    # L2 Normalize the vector to unit length
    magnitude = math.sqrt(sum(x * x for x in raw_vec)) or 1.0
    return [x / magnitude for x in raw_vec]


async def embed_text(text: str) -> List[float]:
    """Calls the configured embedding provider. Provider + model read from settings/env.
    
    Returns:
        List of floats with the configured embedding dimension (default 1536).
    """
    provider = settings.embedding_provider.lower()
    openai_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY", "")
    gemini_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")

    # Auto-detect available provider if default key is missing
    active_provider = provider
    if provider == "openai" and not openai_key and gemini_key:
        active_provider = "gemini"

    # 1. OpenAI Embeddings
    if active_provider == "openai" and openai_key:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/embeddings",
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={
                        "model": settings.embedding_model,
                        "input": text,
                        "dimensions": settings.embedding_dimension,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["data"][0]["embedding"]
        except Exception as e:
            logger.error(f"OpenAI embedding error: {e}. Falling back to deterministic embedding.")

    # 2. Gemini Embeddings
    elif active_provider == "gemini" and gemini_key:
        try:
            model_name = "gemini-embedding-001"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:embedContent?key={gemini_key}"
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    json={
                        "model": f"models/{model_name}",
                        "content": {"parts": [{"text": text}]},
                        "outputDimensionality": settings.embedding_dimension,
                    },
                )
                response.raise_for_status()
                data = response.json()
                embedding = data["embedding"]["values"]
                
                # If dimension doesn't match 1536, pad or truncate cleanly
                if len(embedding) < settings.embedding_dimension:
                    embedding += [0.0] * (settings.embedding_dimension - len(embedding))
                elif len(embedding) > settings.embedding_dimension:
                    embedding = embedding[: settings.embedding_dimension]
                return embedding
        except Exception as e:
            logger.error(f"Gemini embedding error: {e}. Falling back to deterministic embedding.")

    # 3. Ollama Embeddings
    elif active_provider == "ollama":
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{settings.ollama_base_url}/api/embeddings",
                    json={
                        "model": settings.embedding_model,
                        "prompt": text,
                    },
                )
                response.raise_for_status()
                data = response.json()
                embedding = data["embedding"]
                if len(embedding) < settings.embedding_dimension:
                    embedding += [0.0] * (settings.embedding_dimension - len(embedding))
                elif len(embedding) > settings.embedding_dimension:
                    embedding = embedding[: settings.embedding_dimension]
                return embedding
        except Exception as e:
            logger.error(f"Ollama embedding error: {e}. Falling back to deterministic embedding.")

    # 4. Mock / Local Deterministic Embedding (default when no live API key is set)
    return _generate_mock_embedding(text, dimension=settings.embedding_dimension)


async def call_llm(
    prompt: str,
    system_prompt: Optional[str] = None,
    model_tier: str = "fast",  # "fast" | "quality"
    history: Optional[List[dict]] = None,
) -> str:
    """Calls configured LLM with prompt, optional system prompt, and multi-turn history.
    
    Supports Gemini (primary 3.8-flash), Groq (automatic fallback), OpenAI, and Ollama.
    """
    provider = settings.llm_provider.lower()
    gemini_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")
    groq_key = settings.groq_api_key or os.getenv("GROQ_API_KEY", "")
    openai_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY", "")

    # Helper function to call Groq
    async def _call_groq() -> str:
        groq_model = (
            settings.groq_fast_model if model_tier == "fast" else settings.groq_quality_model
        )
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        if history:
            for h in history:
                role = "user" if h.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": h.get("content", "")})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}"},
                json={
                    "model": groq_model,
                    "messages": messages,
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    # Helper function to call Gemini
    async def _call_gemini() -> str:
        gemini_model = (
            settings.llm_fast_model if model_tier == "fast" else settings.llm_quality_model
        )
        contents = []
        if history:
            for h in history:
                role = "user" if h.get("role") == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": h.get("content", "")}]
                })
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        payload = {"contents": contents}
        if system_prompt:
            payload["system_instruction"] = {
                "parts": [{"text": system_prompt}]
            }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_key}"
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    # 1. Primary: Gemini (with resilient Groq fallback)
    if provider == "gemini" and gemini_key:
        try:
            return await _call_gemini()
        except Exception as e:
            logger.warning(f"Primary Gemini LLM error ({e}). Attempting resilient fallback to Groq...")
            if groq_key:
                try:
                    return await _call_groq()
                except Exception as groq_err:
                    logger.error(f"Fallback Groq also failed: {groq_err}")
            raise

    # 2. Primary: Groq (if configured as primary)
    elif provider == "groq" and groq_key:
        try:
            return await _call_groq()
        except Exception as e:
            logger.warning(f"Primary Groq LLM error ({e}). Attempting fallback to Gemini...")
            if gemini_key:
                try:
                    return await _call_gemini()
                except Exception as gem_err:
                    logger.error(f"Fallback Gemini also failed: {gem_err}")
            raise

    # 3. OpenAI (if configured and key available)
    elif provider == "openai" and openai_key:
        model_name = settings.llm_fast_model if model_tier == "fast" else settings.llm_quality_model
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        if history:
            for h in history:
                role = "user" if h.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": h.get("content", "")})
        messages.append({"role": "user", "content": prompt})

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={
                        "model": model_name,
                        "messages": messages,
                        "temperature": 0.7,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"OpenAI LLM error: {e}")
            raise

    # 4. Ollama
    elif provider == "ollama":
        model_name = settings.llm_fast_model if model_tier == "fast" else settings.llm_quality_model
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{settings.ollama_base_url}/api/generate",
                    json={
                        "model": model_name,
                        "prompt": prompt,
                        "system": system_prompt or "",
                        "stream": False,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["response"]
        except Exception as e:
            logger.error(f"Ollama LLM error: {e}")
            raise

    # 5. Fallback if keys are missing
    if groq_key:
        return await _call_groq()
    if gemini_key:
        return await _call_gemini()

    raise RuntimeError("No valid LLM provider credentials configured.")


async def stream_llm(
    prompt: str,
    system_prompt: Optional[str] = None,
    model_tier: str = "fast",
    history: Optional[List[dict]] = None,
) -> AsyncGenerator[str, None]:
    """Streams LLM response tokens.
    
    Tries Gemini stream first; if 503/429 occurs, smoothly falls back to Groq stream.
    """
    gemini_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")
    groq_key = settings.groq_api_key or os.getenv("GROQ_API_KEY", "")

    # Helper function to stream Groq
    async def _stream_groq() -> AsyncGenerator[str, None]:
        groq_model = (
            settings.groq_fast_model if model_tier == "fast" else settings.groq_quality_model
        )
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        if history:
            for h in history:
                role = "user" if h.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": h.get("content", "")})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}"},
                json={
                    "model": groq_model,
                    "messages": messages,
                    "temperature": 0.7,
                    "stream": True,
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: ") and line.strip() != "data: [DONE]":
                        try:
                            chunk_data = json.loads(line[6:])
                            delta = chunk_data["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue

    # Helper function to stream Gemini
    async def _stream_gemini() -> AsyncGenerator[str, None]:
        gemini_model = (
            settings.llm_fast_model if model_tier == "fast" else settings.llm_quality_model
        )
        contents = []
        if history:
            for h in history:
                role = "user" if h.get("role") == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": h.get("content", "")}]
                })
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        payload = {"contents": contents}
        if system_prompt:
            payload["system_instruction"] = {
                "parts": [{"text": system_prompt}]
            }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:streamGenerateContent?key={gemini_key}&alt=sse"
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            chunk_data = json.loads(line[6:])
                            candidates = chunk_data.get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                for part in parts:
                                    text = part.get("text", "")
                                    if text:
                                        yield text
                        except Exception:
                            continue

    # Attempt primary Gemini stream with automatic Groq fallback
    if gemini_key:
        try:
            streamed_any = False
            async for token in _stream_gemini():
                streamed_any = True
                yield token
            if streamed_any:
                return
        except Exception as e:
            logger.warning(f"Primary Gemini streaming failed ({e}). Attempting fallback to Groq...")

    if groq_key:
        try:
            async for token in _stream_groq():
                yield token
            return
        except Exception as groq_err:
            logger.error(f"Fallback Groq stream also failed: {groq_err}")

    # Fallback to non-streaming response
    non_stream_res = await call_llm(
        prompt=prompt,
        system_prompt=system_prompt,
        model_tier=model_tier,
        history=history,
    )
    yield non_stream_res
