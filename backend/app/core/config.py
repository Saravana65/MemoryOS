from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, ValidationInfo
from typing import Any

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "MemoryOS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Postgres vars
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: str | None = None

    # Redis
    REDIS_URL: str

    # Qdrant
    QDRANT_HOST: str
    QDRANT_PORT: int = 6333

    # MinIO
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_SECURE: bool = False
    MINIO_BUCKET_NAME: str = "memoryos-documents"

    # OpenAI
    OPENAI_API_KEY: str = ""

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v:
            return v
        
        data = info.data
        postgres_user = data.get("POSTGRES_USER")
        postgres_password = data.get("POSTGRES_PASSWORD")
        postgres_server = data.get("POSTGRES_SERVER")
        postgres_db = data.get("POSTGRES_DB")
        
        return f"postgresql+asyncpg://{postgres_user}:{postgres_password}@{postgres_server}/{postgres_db}"

settings = Settings()
