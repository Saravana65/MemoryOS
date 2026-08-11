import uuid
from fastapi import APIRouter, Depends, UploadFile, File, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse, PaginatedDocumentResponse, DocumentDetailResponse
from app.exceptions import BadRequestException, NotFoundException
from app.services.storage_service import StorageService

router = APIRouter()
storage_service = StorageService()

ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "text/plain": "txt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
}

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise BadRequestException(
            "Unsupported file type. Allowed formats: PDF, PNG, JPG, JPEG, TXT, DOCX."
        )
    
    file_type = ALLOWED_MIME_TYPES[file.content_type]

    # Validate file size by reading
    file_bytes = await file.read()
    file_size = len(file_bytes)
    
    if file_size > MAX_FILE_SIZE:
        raise BadRequestException("File size exceeds the 25MB limit.")

    document_id = uuid.uuid4()
    # Key: {user_id}/{document_id}/{filename}
    storage_path = f"{current_user.id}/{document_id}/{file.filename}"

    # Upload to MinIO
    try:
        storage_service.upload_file(file_bytes, storage_path, file.content_type)
    except Exception as e:
        raise BadRequestException(f"Failed to upload file to storage: {str(e)}")

    # Save to database
    db_doc = Document(
        id=document_id,
        user_id=current_user.id,
        filename=file.filename,
        file_type=file_type,
        mime_type=file.content_type,
        file_size_bytes=file_size,
        storage_path=storage_path,
        status="pending"
    )
    db.add(db_doc)
    await db.commit()
    await db.refresh(db_doc)

    return db_doc

@router.get("", response_model=PaginatedDocumentResponse)
async def list_files(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * page_size

    # Total count
    total_result = await db.execute(
        select(func.count(Document.id)).where(Document.user_id == current_user.id)
    )
    total = total_result.scalar() or 0

    # Retrieve paginated items
    items_result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
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

@router.get("/{document_id}", response_model=DocumentDetailResponse)
async def get_file_details(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundException("Document not found")
    
    return doc

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundException("Document not found")

    # Delete from MinIO S3
    try:
        storage_service.delete_file(doc.storage_path)
    except Exception:
        # Continue with DB deletion even if storage fails
        pass

    # Delete from DB
    await db.delete(doc)
    await db.commit()
    return None

@router.get("/{document_id}/download")
async def download_file(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundException("Document not found")

    # Generate presigned download URL valid for 5 minutes (300 seconds)
    url = storage_service.generate_presigned_url(doc.storage_path, expires_in=300)
    
    # Redirect client to presigned URL
    return RedirectResponse(url=url)
