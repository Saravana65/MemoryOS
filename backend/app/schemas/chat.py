import uuid
from datetime import datetime
from pydantic import BaseModel

class ChatSessionResponse(BaseModel):
    id: uuid.UUID
    title: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedChatSessionResponse(BaseModel):
    items: list[ChatSessionResponse]
    total: int
    page: int
    page_size: int
    pages: int

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    sources: list[dict] | None = None
    created_at: datetime

    class Config:
        from_attributes = True
