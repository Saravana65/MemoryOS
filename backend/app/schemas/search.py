import uuid
from datetime import datetime
from pydantic import BaseModel

class SearchMatch(BaseModel):
    chunk_text: str
    page_number: int | None = None
    score: float

class SearchResultItem(BaseModel):
    document_id: uuid.UUID
    filename: str
    file_type: str
    created_at: datetime
    matches: list[SearchMatch]

class PaginatedSearchResult(BaseModel):
    items: list[SearchResultItem]
    total: int
    page: int
    page_size: int
    pages: int
