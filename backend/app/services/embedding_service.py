from openai import AsyncOpenAI
from app.core.config import settings

class EmbeddingService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "text-embedding-3-small"

    async def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        
        response = await self.client.embeddings.create(
            input=texts,
            model=self.model
        )
        return [item.embedding for item in response.data]
