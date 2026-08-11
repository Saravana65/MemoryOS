import asyncio
import uuid
from celery import shared_task
from sqlalchemy.future import select

from app.core.database import async_session_maker
from app.core.logging import logger
from app.models.document import Document, MemoryChunk
from app.services.storage_service import StorageService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store_service import VectorStoreService

# Import extractors
from app.workers.extractors.pdf_extractor import extract_pdf_pages
from app.workers.extractors.ocr_extractor import extract_text_from_image_bytes
from app.workers.extractors.text_extractor import extract_text_from_txt_bytes
from app.workers.extractors.docx_extractor import extract_text_from_docx_bytes

# Import chunker
from app.workers.chunking import chunk_document_text
from app.workers.celery_app import celery_app

@celery_app.task(name="app.workers.process_document.process_document")
def process_document(document_id: str) -> None:
    logger.info(f"Celery task received for document_id: {document_id}")
    asyncio.run(async_process_document(document_id))

async def async_process_document(document_id: str) -> None:
    doc_uuid = uuid.UUID(document_id)
    
    async with async_session_maker() as db:
        # 1. Fetch document and set status to processing
        result = await db.execute(select(Document).where(Document.id == doc_uuid))
        doc = result.scalar_one_or_none()
        if not doc:
            logger.error(f"Document {document_id} not found in database.")
            return

        doc.status = "processing"
        doc.processing_error = None
        await db.commit()
        await db.refresh(doc)
        logger.info(f"Document status set to processing for: {doc.filename}")

        try:
            # 2. Fetch raw file from MinIO
            storage_service = StorageService()
            response = storage_service.s3_client.get_object(
                Bucket=storage_service.bucket_name,
                Key=doc.storage_path
            )
            file_bytes = response['Body'].read()
            logger.info(f"Downloaded {len(file_bytes)} bytes from storage path: {doc.storage_path}")

            # 3. Route to the correct extractor based on file_type
            pages = []
            if doc.file_type == "pdf":
                pages = extract_pdf_pages(file_bytes)
            elif doc.file_type == "image":
                text = extract_text_from_image_bytes(file_bytes)
                pages = [{"page_number": None, "text": text}]
            elif doc.file_type == "txt":
                text = extract_text_from_txt_bytes(file_bytes)
                pages = [{"page_number": None, "text": text}]
            elif doc.file_type == "docx":
                text = extract_text_from_docx_bytes(file_bytes)
                pages = [{"page_number": None, "text": text}]
            else:
                raise Exception(f"Unsupported file type for processing: {doc.file_type}")

            # 4. Check if extraction produced any text
            total_text = "".join([p["text"].strip() for p in pages]).strip()
            if not total_text:
                raise Exception("Document text extraction returned empty content.")

            # 5. Chunk the text
            chunks = chunk_document_text(pages)
            if not chunks:
                raise Exception("Chunking failed or produced zero chunks.")
            logger.info(f"Partitioned document into {len(chunks)} text chunks.")

            # 6. Generate embeddings
            embedding_service = EmbeddingService()
            texts = [c["text"] for c in chunks]
            embeddings = await embedding_service.get_embeddings(texts)
            if len(embeddings) != len(chunks):
                raise Exception("Mismatched chunk-embeddings count returned from service.")

            # 7. Upsert chunks into Qdrant and save to DB
            vector_store = VectorStoreService()
            points_data = []
            db_chunks = []

            for idx, chunk in enumerate(chunks):
                chunk_uuid = uuid.uuid4()
                
                # Qdrant Point Payload
                points_data.append({
                    "id": chunk_uuid,
                    "vector": embeddings[idx],
                    "payload": {
                        "user_id": str(doc.user_id),
                        "document_id": str(doc.id),
                        "chunk_id": str(chunk_uuid),
                        "chunk_text": chunk["text"],
                        "file_type": doc.file_type,
                        "page_number": chunk["page_number"]
                    }
                })

                # DB Chunk Row
                db_chunk = MemoryChunk(
                    id=chunk_uuid,
                    document_id=doc.id,
                    user_id=doc.user_id,
                    chunk_index=idx,
                    chunk_text=chunk["text"],
                    vector_id=str(chunk_uuid),
                    token_count=chunk["token_count"],
                    page_number=chunk["page_number"]
                )
                db_chunks.append(db_chunk)

            # Perform indexing
            vector_store.upsert_chunks(points_data)
            db.add_all(db_chunks)
            
            # 8. Set status to ready
            doc.status = "ready"
            await db.commit()
            logger.info(f"Ingestion pipeline completed successfully for document: {doc.filename}")

        except Exception as err:
            logger.error(f"Error occurred during document processing: {err}")
            doc.status = "failed"
            doc.processing_error = str(err)
            await db.commit()
