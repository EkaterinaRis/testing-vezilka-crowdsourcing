from image_to_text.image_to_text import transform

from PIL import Image
from dataclasses import dataclass
from typing import Optional

CHUNK_SIZE = 1000 # characters per chunk
OVERLAP = 0 # keeps context between chunks
OCR_PAGES = True

def ocr_page(page):
    pix = page.get_pixmap()
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return transform(img)

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=OVERLAP):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks

@dataclass
class DatasetRow:
    id: str
    text: str
    source: str
    chunk: int
    topic: str
    description: str
    file_type: str
    
    # Optional metadata
    dialect: Optional[int] = None
    page: Optional[int] = None