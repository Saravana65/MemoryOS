import docx
import io
from app.core.logging import logger

def extract_text_from_docx_bytes(docx_bytes: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(docx_bytes))
        paragraphs_text = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs_text)
    except Exception as e:
        logger.error(f"Docx Extraction failed: {e}")
        raise e
