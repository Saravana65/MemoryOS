import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.document import Document
from app.services.embedding_service import EmbeddingService
from app.services.vector_store_service import VectorStoreService

class SearchService:
    def __init__(self) -> None:
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()

    async def search(
        self,
        user_id: uuid.UUID,
        query: str,
        page: int,
        page_size: int,
        db: AsyncSession
    ) -> dict:
        # 1. Embed search query
        embeddings = await self.embedding_service.get_embeddings([query])
        if not embeddings:
            return {
                "items": [],
                "total": 0,
                "page": page,
                "page_size": page_size,
                "pages": 0
            }
        query_vector = embeddings[0]

        # 2. Retrieve top 20 chunks from Qdrant matching user_id filter
        results = self.vector_store.search_chunks(
            user_id=str(user_id),
            query_vector=query_vector,
            limit=20
        )

        if not results:
            return {
                "items": [],
                "total": 0,
                "page": page,
                "page_size": page_size,
                "pages": 0
            }

        # 3. Retrieve parent documents that are ready and owned by this user
        doc_ids = list(set([uuid.UUID(r["payload"]["document_id"]) for r in results]))
        doc_result = await db.execute(
            select(Document).where(
                Document.id.in_(doc_ids),
                Document.user_id == user_id,
                Document.status == "ready"
            )
        )
        docs = doc_result.scalars().all()
        docs_map = {str(d.id): d for d in docs}

        # 4. Group matches by document
        grouped = {}
        for r in results:
            payload = r["payload"]
            doc_id = payload["document_id"]
            if doc_id not in docs_map:
                continue
            if doc_id not in grouped:
                grouped[doc_id] = []
            grouped[doc_id].append({
                "chunk_text": payload["chunk_text"],
                "page_number": payload.get("page_number"),
                "score": r["score"]
            })

        # 5. Build results list
        items = []
        for doc_id, matches in grouped.items():
            doc = docs_map[doc_id]
            items.append({
                "document_id": doc.id,
                "filename": doc.filename,
                "file_type": doc.file_type,
                "created_at": doc.created_at,
                "matches": matches
            })

        # 6. Sort results descending by highest matches score
        items.sort(key=lambda item: max([m["score"] for m in item["matches"]]), reverse=True)

        # 7. Apply pagination
        total = len(items)
        offset = (page - 1) * page_size
        paginated_items = items[offset:offset+page_size]
        pages = (total + page_size - 1) // page_size if total > 0 else 0

        return {
            "items": paginated_items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages
        }
