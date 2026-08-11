import pytesseract
from PIL import Image
import io
from app.core.logging import logger

def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        logger.error(f"OCR Extraction failed: {e}")
        raise e
