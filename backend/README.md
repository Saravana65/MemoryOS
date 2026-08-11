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

## File Ingestion & Metadata Endpoints

Handles secure document cataloging. Requires a valid JWT bearer token.

### 1. Upload File (`POST /api/v1/files/upload`)
Enforces sizes <= 25MB and MIME formats (PDF, PNG, JPG, JPEG, TXT, DOCX). Enqueues asynchronous indexing.
*   **Example curl**:
    ```bash
    curl -X POST "http://localhost:8000/api/v1/files/upload" \
         -H "Authorization: Bearer <your_jwt_access_token>" \
         -F "file=@/path/to/annual_report.pdf"
    ```

### 2. List Files (`GET /api/v1/files`)
Returns paginated results matching `{ items, total, page, page_size, pages }`.
*   **Example curl**:
    ```bash
    curl -X GET "http://localhost:8000/api/v1/files?page=1&page_size=10" \
         -H "Authorization: Bearer <your_jwt_access_token>"
    ```

### 3. Details, Deletion, and Presigned Downloads
*   **Get Details (`GET /api/v1/files/{document_id}`)**
*   **Delete Document (`DELETE /api/v1/files/{document_id}`)** (Purges DB and MinIO)
*   **Download Redirect (`GET /api/v1/files/{document_id}/download`)** (307 redirect to MinIO)

---

## RAG Chat Endpoints

Enables users to manage conversational sessions and perform context-grounded RAG query answers with source citations. Enforces absolute user isolation on all transactions.

### 1. Create Session
*   **Method**: `POST`
*   **Path**: `/api/v1/chat/sessions`
*   **Response**:
    ```json
    {
      "id": "a576e82a-d81a-4d3b-82ef-d71d87e07a3c",
      "title": null,
      "created_at": "2026-08-11T13:00:00Z"
    }
    ```
*   **Example curl**:
    ```bash
    curl -X POST "http://localhost:8000/api/v1/chat/sessions" \
         -H "Authorization: Bearer <your_jwt_access_token>"
    ```

### 2. List Sessions
*   **Method**: `GET`
*   **Path**: `/api/v1/chat/sessions`
*   **Query Params**: `page` (default `1`), `page_size` (default `20`).
*   **Response**: Paginated lists ordered by `updated_at` descending.
    ```json
    {
      "items": [
        {
          "id": "a576e82a-d81a-4d3b-82ef-d71d87e07a3c",
          "title": null,
          "created_at": "2026-08-11T13:00:00Z"
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
    curl -X GET "http://localhost:8000/api/v1/chat/sessions?page=1&page_size=10" \
         -H "Authorization: Bearer <your_jwt_access_token>"
    ```

### 3. Session Operations (Details & Delete)
*   **Get Session Metadata (`GET /api/v1/chat/sessions/{session_id}`)**: Enforces ownership, returning `404` if not found or not owned.
*   **Delete Session (`DELETE /api/v1/chat/sessions/{session_id}`)**: Cascades message deletions. Returns `204`.

### 4. Create RAG Message
*   **Method**: `POST`
*   **Path**: `/api/v1/chat/sessions/{session_id}/messages`
*   **Payload**: `{ "content": "How do I setup Docker?" }`
*   **Behavior**: 
    1. Embeds question.
    2. Retrieves top 8 chunks from Qdrant strictly filtered by `user_id`.
    3. If zero chunks found, yields immediate fallback: *"I couldn't find anything in your documents about that."*
    4. Otherwise, loads last 6 messages history, constructs a grounded system instruction, and runs generation via Anthropic Claude 3.5 Sonnet.
    5. Saves conversational logs, storing retrieved source citations (`{document_id, chunk_id, filename, snippet, page_number}`) inside message JSONB payload.
*   **Response**:
    ```json
    {
      "id": "b96a843a-f11a-4d3b-92ef-e81e87e08b3c",
      "role": "assistant",
      "content": "To set up Docker, run the compose file in the root...",
      "sources": [
        {
          "document_id": "7a9df72e-c75c-4d3b-82ef-d71d87e07a3c",
          "chunk_id": "cbb42e61-a083-4a67-8e6d-74d32f5f190e",
          "filename": "annual_report.pdf",
          "snippet": "To set up Docker...",
          "page_number": 2
        }
      ],
      "created_at": "2026-08-11T13:01:00Z"
    }
    ```
*   **Example curl**:
    ```bash
    curl -X POST "http://localhost:8000/api/v1/chat/sessions/a576e82a-d81a-4d3b-82ef-d71d87e07a3c/messages" \
         -H "Authorization: Bearer <your_jwt_access_token>" \
         -H "Content-Type: application/json" \
         -d '{"content": "What is the project budget?"}'
    ```

### 5. Get Session Messages
*   **Method**: `GET`
*   **Path**: `/api/v1/chat/sessions/{session_id}/messages`
*   **Response**: Full chat history sorted chronologically (`created_at` asc).
*   **Example curl**:
    ```bash
    curl -X GET "http://localhost:8000/api/v1/chat/sessions/a576e82a-d81a-4d3b-82ef-d71d87e07a3c/messages" \
         -H "Authorization: Bearer <your_jwt_access_token>"
    ```
