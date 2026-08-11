import fitz
from app.workers.extractors.ocr_extractor import extract_text_from_image_bytes
from app.core.logging import logger

def extract_pdf_pages(file_bytes: bytes) -> list[dict]:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages_data = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            
            # If no text is found, fall back to image-based OCR on this page
            if not text.strip():
                logger.info(f"PDF page {page_num + 1} has no extractable text. Falling back to OCR...")
                try:
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("png")
                    text = extract_text_from_image_bytes(img_bytes)
                except Exception as ocr_err:
                    logger.error(f"OCR fallback failed on PDF page {page_num + 1}: {ocr_err}")
                    text = ""
            
            pages_data.append({
                "page_number": page_num + 1,
                "text": text
            })
            
        return pages_data
    except Exception as e:
        logger.error(f"PDF Extraction failed: {e}")
        raise e
