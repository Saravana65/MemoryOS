def extract_text_from_txt_bytes(txt_bytes: bytes) -> str:
    return txt_bytes.decode("utf-8", errors="ignore")
