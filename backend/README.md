# MemoryOS Backend

MemoryOS backend service powered by FastAPI, PostgreSQL, Redis, Qdrant, and MinIO.

## Development Setup

### Running Infrastructure

Use the docker compose file in the project root to spin up required services:
```bash
docker compose up -d
```

Run Alembic database migrations:
```bash
docker compose exec backend alembic upgrade head
```

The FastAPI application will be accessible at `http://localhost:8000`. Interactive documentation is available at `/docs` (Swagger UI).

---

## File Upload & Document Metadata Endpoints

This module handles secure file ingestion and document catalog tracking. All endpoints require a valid JWT bearer token.

### 1. Upload File
*   **Method**: `POST`
*   **Path**: `/api/v1/files/upload`
*   **Payload**: `multipart/form-data` with a single file field named `file`.
*   **Constraints**:
    *   Maximum file size: **25MB**.
    *   Allowed MIME formats: `pdf` (`application/pdf`), `png` (`image/png`), `jpg/jpeg` (`image/jpeg`), `txt` (`text/plain`), `docx` (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
    *   Attempts to upload other extensions or sizes will fail with `400 Bad Request`.
*   **Response**:
    ```json
    {
      "id": "7a9df72e-c75c-4d3b-82ef-d71d87e07a3c",
      "filename": "annual_report.pdf",
      "status": "pending",
      "file_size_bytes": 245312,
      "created_at": "2026-08-11T12:00:00Z"
    }
    ```
*   **Example curl**:
    ```bash
    curl -X POST "http://localhost:8000/api/v1/files/upload" \
         -H "Authorization: Bearer <your_jwt_access_token>" \
         -F "file=@/path/to/annual_report.pdf"
    ```

### 2. List Files
*   **Method**: `GET`
*   **Path**: `/api/v1/files`
*   **Query Params**: `page` (default `1`), `page_size` (default `20`).
*   **Response**: Paginated document list. Ordered by upload time descending (`created_at` desc). Only returns documents owned by the logged-in user.
    ```json
    {
      "items": [
        {
          "id": "7a9df72e-c75c-4d3b-82ef-d71d87e07a3c",
          "filename": "annual_report.pdf",
          "status": "pending",
          "file_size_bytes": 245312,
          "created_at": "2026-08-11T12:00:00Z"
        }
      ],
      "total": 1,
      "page": 1,
      "page_size": 20,
      "pages": 1
    }
    ```
*   **Example curl**:
    ```bash
    curl -X GET "http://localhost:8000/api/v1/files?page=1&page_size=10" \
         -H "Authorization: Bearer <your_jwt_access_token>"
    ```

### 3. Get File Details
*   **Method**: `GET`
*   **Path**: `/api/v1/files/{document_id}`
*   **Response**: Detailed metadata of the document. If not found or if the document is owned by a different user, returns `404 Not Found` (to prevent metadata leak).
    ```json
    {
      "id": "7a9df72e-c75c-4d3b-82ef-d71d87e07a3c",
      "user_id": "8b9e883a-c85c-4d3c-92ef-e81e87e08b3c",
      "filename": "annual_report.pdf",
      "file_type": "pdf",
      "mime_type": "application/pdf",
      "file_size_bytes": 245312,
      "storage_path": "8b9e883a-c85c-4d3c-92ef-e81e87e08b3c/7a9df72e-c75c-4d3b-82ef-d71d87e07a3c/annual_report.pdf",
      "status": "pending",
      "processing_error": null,
      "created_at": "2026-08-11T12:00:00Z",
      "updated_at": "2026-08-11T12:00:00Z"
    }
    ```
*   **Example curl**:
    ```bash
    curl -X GET "http://localhost:8000/api/v1/files/7a9df72e-c75c-4d3b-82ef-d71d87e07a3c" \
         -H "Authorization: Bearer <your_jwt_access_token>"
    ```

### 4. Delete File
*   **Method**: `DELETE`
*   **Path**: `/api/v1/files/{document_id}`
*   **Description**: Deletes the metadata record from PostgreSQL and deletes the file from MinIO object storage. If not owned by current user, returns `404`.
*   **Response**: `204 No Content`
*   **Example curl**:
    ```bash
    curl -X DELETE "http://localhost:8000/api/v1/files/7a9df72e-c75c-4d3b-82ef-d71d87e07a3c" \
         -H "Authorization: Bearer <your_jwt_access_token>"
    ```

### 5. Download File
*   **Method**: `GET`
*   **Path**: `/api/v1/files/{document_id}/download`
*   **Behavior**: Generates a presigned MinIO URL valid for 5 minutes (300 seconds) and immediately responds with a `307 Temporary Redirect` directing the client to MinIO.
*   **Response**: `307 Temporary Redirect` (redirecting to the presigned url)
*   **Example curl**:
    ```bash
    curl -L -X GET "http://localhost:8000/api/v1/files/7a9df72e-c75c-4d3b-82ef-d71d87e07a3c/download" \
         -H "Authorization: Bearer <your_jwt_access_token>" \
         --output annual_report.pdf
    ```
