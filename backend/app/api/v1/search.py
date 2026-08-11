from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.search import PaginatedSearchResult
from app.exceptions import BadRequestException
from app.services.search_service import SearchService

router = APIRouter()
search_service = SearchService()

@router.get("", response_model=PaginatedSearchResult)
async def semantic_search(
    q: str = Query(..., description="Search query string"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not q or not q.strip():
        raise BadRequestException("Search query parameter q is required and cannot be empty.")

    results = await search_service.search(
        user_id=current_user.id,
        query=q.strip(),
        page=page,
        page_size=page_size,
        db=db
    )
    return results
