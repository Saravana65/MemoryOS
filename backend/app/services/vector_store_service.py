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
