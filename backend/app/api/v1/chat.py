import uuid
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import (
    ChatSessionResponse,
    PaginatedChatSessionResponse,
    ChatMessageCreate,
    ChatMessageResponse
)
from app.exceptions import NotFoundException
from app.services.rag_service import RAGService

router = APIRouter()
rag_service = RAGService()

@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    session = ChatSession(
        user_id=current_user.id,
        title=None
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/sessions", response_model=PaginatedChatSessionResponse)
async def list_chat_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * page_size

    # Total count
    total_result = await db.execute(
        select(func.count(ChatSession.id)).where(ChatSession.user_id == current_user.id)
    )
    total = total_result.scalar() or 0

    # Retrieve paginated items sorted by updated_at descending
    items_result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    items = items_result.scalars().all()

    pages = (total + page_size - 1) // page_size if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages
    }

@router.get("/sessions/{id}", response_model=ChatSessionResponse)
async def get_chat_session(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == id, ChatSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundException("Chat session not found")
    return session

@router.delete("/sessions/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_session(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == id, ChatSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundException("Chat session not found")

    await db.delete(session)
    await db.commit()
    return None

@router.post("/sessions/{id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_message(
    id: uuid.UUID,
    message_input: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify session ownership
    session_result = await db.execute(
        select(ChatSession).where(ChatSession.id == id, ChatSession.user_id == current_user.id)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise NotFoundException("Chat session not found")

    # Core RAG retrieval, LLM prompt, and generation orchestration
    assistant_msg = await rag_service.generate_response(
        user_id=current_user.id,
        session_id=session.id,
        question=message_input.content,
        db=db
    )
    return assistant_msg

@router.get("/sessions/{id}/messages", response_model=list[ChatMessageResponse])
async def list_chat_messages(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify session ownership
    session_result = await db.execute(
        select(ChatSession).where(ChatSession.id == id, ChatSession.user_id == current_user.id)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise NotFoundException("Chat session not found")

    # Fetch messages ordered chronologically (created_at asc)
    messages_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = messages_result.scalars().all()
    return messages
