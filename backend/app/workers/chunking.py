from typing import TypedDict, List
import tiktoken

class Chunk(TypedDict):
    text: str
    token_count: int
    page_number: int | None

def chunk_document_text(
    pages: List[dict],
    chunk_size: int = 600,
    overlap: int = 90
) -> List[Chunk]:
    chunks = []
    
    # Use standard cl100k_base encoding matching text-embedding-3-small
    encoding = tiktoken.get_encoding("cl100k_base")
    
    for page in pages:
        page_num = page.get("page_number")
        text = page.get("text", "").strip()
        if not text:
            continue
            
        tokens = encoding.encode(text)
        num_tokens = len(tokens)
        
        # If the page's token count fits inside a single chunk size, add it directly
        if num_tokens <= chunk_size:
            chunks.append({
                "text": text,
                "token_count": num_tokens,
                "page_number": page_num
            })
            continue
            
        # Perform sliding window token chunk partitioning
        start = 0
        while start < num_tokens:
            end = min(start + chunk_size, num_tokens)
            chunk_tokens = tokens[start:end]
            chunk_text = encoding.decode(chunk_tokens)
            
            chunks.append({
                "text": chunk_text,
                "token_count": len(chunk_tokens),
                "page_number": page_num
            })
            
            start += chunk_size - overlap
            if end == num_tokens:
                break
                
    return chunks
