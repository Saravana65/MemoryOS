import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from anthropic import AsyncAnthropic

from app.core.config import settings
from app.core.logging import logger
from app.models.chat import ChatSession, ChatMessage
from app.models.document import Document
from app.services.embedding_service import EmbeddingService
from app.services.vector_store_service import VectorStoreService

class RAGService:
    def __init__(self) -> None:
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()
        self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def generate_response(
        self,
        user_id: uuid.UUID,
        session_id: uuid.UUID,
        question: str,
        db: AsyncSession
    ) -> ChatMessage:
        # 1. Embed user question
        try:
            embeddings = await self.embedding_service.get_embeddings([question])
            query_vector = embeddings[0]
        except Exception as e:
            logger.error(f"Failed to generate query embedding: {e}")
            raise e

        # 2. Search Qdrant filtered by user_id
        try:
            results = self.vector_store.search_chunks(
                user_id=str(user_id),
                query_vector=query_vector,
                limit=8
            )
        except Exception as e:
            logger.error(f"Failed Qdrant vector retrieval search: {e}")
            raise e

        # 3. If zero chunks found, skip LLM call and return fallback response
        if not results:
            logger.info("Zero context chunks retrieved. Skipping LLM call.")
            user_msg = ChatMessage(
                session_id=session_id,
                role="user",
                content=question
            )
            assistant_msg = ChatMessage(
                session_id=session_id,
                role="assistant",
                content="I couldn't find anything in your documents about that.",
                sources=[]
            )
            db.add(user_msg)
            db.add(assistant_msg)
            
            # Update session's updated_at timestamp
            session_result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
            session = session_result.scalar_one()
            session.updated_at = func.now()
            
            await db.commit()
            await db.refresh(assistant_msg)
            return assistant_msg

        # 4. Resolve filenames from DB for retrieved document_ids
        doc_ids = list(set([uuid.UUID(r["payload"]["document_id"]) for r in results]))
        doc_result = await db.execute(select(Document).where(Document.id.in_(doc_ids)))
        docs_map = {str(d.id): d.filename for d in doc_result.scalars().all()}

        # 5. Build context snippets and sources payload
        sources = []
        context_parts = []
        for idx, r in enumerate(results):
            payload = r["payload"]
            doc_id = payload["document_id"]
            filename = docs_map.get(doc_id, "Unknown File")
            
            sources.append({
                "document_id": doc_id,
                "chunk_id": payload["chunk_id"],
                "filename": filename,
                "snippet": payload["chunk_text"],
                "page_number": payload["page_number"]
            })

            page_str = f", Page {payload['page_number']}" if payload.get("page_number") else ""
            context_parts.append(
                f"Source [{idx + 1}]: {filename}{page_str}\n"
                f"Snippet: {payload['chunk_text']}\n"
                f"---"
            )
        context_str = "\n\n".join(context_parts)

        # 6. Retrieve history (last 6 messages of session)
        history_result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(6)
        )
        history_msgs = list(reversed(history_result.scalars().all()))

        # 7. Construct messages payloads matching Claude messages API role contract
        messages = []
        for m in history_msgs:
            messages.append({
                "role": m.role,
                "content": m.content
            })
        
        # Append current user prompt
        messages.append({
            "role": "user",
            "content": question
        })

        system_instruction = (
            "You are MemoryOS, a personal knowledge vault assistant.\n"
            "Answer the user's question ONLY using the provided Source context blocks below.\n"
            "Cite which Source each claim comes from.\n"
            "If the context does not contain information to answer the question, state explicitly:\n"
            "\"I don't have information about that in your documents.\"\n"
            "Do NOT fall back on general knowledge or assume any facts not directly stated in the context.\n\n"
            f"=== CONTEXT DOCUMENTS ===\n{context_str}"
        )

        # 8. Call Anthropic Claude Messages API
        try:
            response = await self.anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                system=system_instruction,
                messages=messages
            )
            answer = response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic Claude API call failed: {e}")
            raise e

        # 9. Save both messages and update session modified time
        user_msg = ChatMessage(
            session_id=session_id,
            role="user",
            content=question
        )
        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=answer,
            sources=sources
        )
        db.add(user_msg)
        db.add(assistant_msg)

        session_result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = session_result.scalar_one()
        session.updated_at = func.now()

        await db.commit()
        await db.refresh(assistant_msg)
        return assistant_msg
