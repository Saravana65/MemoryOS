import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.core.config import settings
from app.core.logging import logger

class StorageService:
    def __init__(self) -> None:
        scheme = "https" if settings.MINIO_SECURE else "http"
        endpoint_url = f"{scheme}://{settings.MINIO_ENDPOINT}"
        
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1"
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME

    def ensure_bucket(self) -> None:
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"MinIO bucket '{self.bucket_name}' already exists.")
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code in ["404", "NoSuchBucket"]:
                logger.info(f"MinIO bucket '{self.bucket_name}' not found. Creating...")
                self.s3_client.create_bucket(Bucket=self.bucket_name)
                logger.info(f"MinIO bucket '{self.bucket_name}' created successfully.")
            else:
                logger.error(f"Error checking MinIO bucket: {e}")
                raise e

    def upload_file(self, file_data: bytes, object_key: str, content_type: str) -> None:
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_data,
                ContentType=content_type
            )
            logger.info(f"Successfully uploaded object '{object_key}' to MinIO.")
        except Exception as e:
            logger.error(f"Failed to upload object '{object_key}' to MinIO: {e}")
            raise e

    def delete_file(self, object_key: str) -> None:
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            logger.info(f"Successfully deleted object '{object_key}' from MinIO.")
        except Exception as e:
            logger.error(f"Failed to delete object '{object_key}' from MinIO: {e}")
            raise e

    def generate_presigned_url(self, object_key: str, expires_in: int = 300) -> str:
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": object_key
                },
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            logger.error(f"Failed to generate presigned URL for '{object_key}': {e}")
            raise e
