from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.config import settings

class VectorStoreService:
    def __init__(self) -> None:
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.collection_name = "memory_vectors"

    def upsert_chunks(self, points_data: list[dict]) -> None:
        if not points_data:
            return

        points = [
            models.PointStruct(
                id=str(p["id"]),
                vector=p["vector"],
                payload=p["payload"]
            )
            for p in points_data
        ]

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search_chunks(self, user_id: str, query_vector: list[float], limit: int = 8) -> list[dict]:
        query_filter = models.Filter(
            must=[
                models.FieldCondition(
                    key="user_id",
                    match=models.MatchValue(value=str(user_id))
                )
            ]
        )

        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=limit
        )

        return [
            {
                "id": r.id,
                "score": r.score,
                "payload": r.payload
            }
            for r in results
        ]
