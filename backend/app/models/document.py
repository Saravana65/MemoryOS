import uuid
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)  # pdf/image/txt/docx/other
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # pending/processing/ready/failed
    processing_error: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    user: Mapped["User"] = relationship("User")
    chunks: Mapped[list["MemoryChunk"]] = relationship(
        "MemoryChunk",
        back_populates="document",
        cascade="all, delete-orphan"
    )

class MemoryChunk(Base):
    __tablename__ = "memory_chunks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    vector_id: Mapped[str] = mapped_column(String(255), nullable=False)
    token_count: Mapped[int] = mapped_column(nullable=False)
    page_number: Mapped[int] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
    user: Mapped["User"] = relationship("User")
