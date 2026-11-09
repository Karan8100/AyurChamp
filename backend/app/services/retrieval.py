from typing import List, Optional

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import async_session
from app.models import KnowledgeChunk
from app.services.llm_client import embed_text


async def retrieve_relevant_chunks(
    query: str,
    k: int = 5,
    max_distance: Optional[float] = None,
    category: Optional[str] = None,
    session: Optional[AsyncSession] = None,
) -> List[KnowledgeChunk]:
    """Embeds the query, runs a pgvector cosine-distance search (<=> operator),
    optionally filtered by category and max_distance relevance threshold.
    
    Args:
        query: User or clinical query string to search for.
        k: Maximum number of top matching chunks to retrieve.
        max_distance: Optional cosine distance cutoff (e.g. 0.40). Chunks with higher distance are excluded.
        category: Optional category filter ("diet" | "lifestyle" | "herb" | "general").
        session: Optional existing AsyncSession. If not provided, a new session is used.
        
    Returns:
        List of matching KnowledgeChunk objects sorted by relevance (highest similarity first).
    """
    # 1. Generate query embedding
    query_vector = await embed_text(query)

    # 2. Define the execution logic
    async def _execute(s: AsyncSession) -> List[KnowledgeChunk]:
        dist_expr = KnowledgeChunk.embedding.cosine_distance(query_vector)
        stmt = select(KnowledgeChunk)
        if category:
            stmt = stmt.where(KnowledgeChunk.category == category)
        if max_distance is not None:
            stmt = stmt.where(dist_expr <= max_distance)
        
        # pgvector cosine_distance <=> ordering (ascending distance = highest similarity)
        stmt = stmt.order_by(dist_expr).limit(k)
        
        result = await s.exec(stmt)
        return list(result.all())

    # 3. Execute with provided or new session
    if session is not None:
        return await _execute(session)
    else:
        async with async_session() as new_session:
            return await _execute(new_session)
