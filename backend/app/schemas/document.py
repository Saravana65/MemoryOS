import uuid
from datetime import datetime
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: uuid.UUID
    filename: str
    status: str
    file_size_bytes: int
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    filename: str
    file_type: str
    mime_type: str
    file_size_bytes: int
    storage_path: str
    status: str
    processing_error: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedDocumentResponse(BaseModel):
    items: list[DocumentResponse]
    total: int
    page: int
    page_size: int
    pages: int
