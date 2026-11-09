"""Chatbot API Router — Exposes the AyurBot conversational co-pilot endpoint."""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_session
from app.models import User
from app.schemas import ChatQueryRequest, ChatQueryResponse
from app.services.ayurbot import generate_ayurbot_response, generate_ayurbot_stream

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


@router.post("/query", response_model=ChatQueryResponse)
async def query_ayurbot(
    request: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Answers user wellness queries grounded in classical Ayurvedic literature and
    personalized to their Prakriti and Vikriti status."""
    return await generate_ayurbot_response(
        query=request.query,
        user=current_user,
        session=session,
        language=request.language,
        history=request.history,
    )


@router.post("/query-stream")
async def query_ayurbot_stream(
    request: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Streams token-by-token AyurBot response via Server-Sent Events (SSE)."""
    return StreamingResponse(
        generate_ayurbot_stream(
            query=request.query,
            user=current_user,
            session=session,
            language=request.language,
            history=request.history,
        ),
        media_type="text/event-stream",
    )

