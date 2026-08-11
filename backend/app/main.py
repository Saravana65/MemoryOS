from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
from qdrant_client.http import models

from app.core.config import settings
from app.api.v1.router import api_router
from app.core.logging import logger
from app.services.storage_service import StorageService

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url=None
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application...")
    
    # Initialize MinIO Bucket on startup
    try:
        storage_service = StorageService()
        storage_service.ensure_bucket()
    except Exception as e:
        logger.error(f"Error initializing MinIO bucket on startup: {e}")
    
    # Initialize Qdrant collection on startup
    try:
        q_client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        collections_response = q_client.get_collections()
        collections = [c.name for c in collections_response.collections]
        
        collection_name = "memory_vectors"
        if collection_name not in collections:
            logger.info(f"Qdrant collection '{collection_name}' not found. Creating...")
            q_client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=1536,
                    distance=models.Distance.COSINE
                )
            )
            # Create payload indexes on user_id and document_id
            q_client.create_payload_index(
                collection_name=collection_name,
                field_name="user_id",
                field_schema=models.PayloadSchemaType.KEYWORD
            )
            q_client.create_payload_index(
                collection_name=collection_name,
                field_name="document_id",
                field_schema=models.PayloadSchemaType.KEYWORD
            )
            logger.info(f"Qdrant collection '{collection_name}' and indexes created successfully.")
        else:
            logger.info(f"Qdrant collection '{collection_name}' already exists.")
    except Exception as e:
        logger.error(f"Error connecting to Qdrant or initializing collection: {e}")

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME
    }

app.include_router(api_router, prefix=settings.API_V1_STR)
