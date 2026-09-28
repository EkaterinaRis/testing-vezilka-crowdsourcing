from pathlib import Path
import pytesseract
from PIL import Image
from image_to_text.preprocess import preprocess
 
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def load_image_and_transform(image_path: Path, preprocess_image: bool = True) -> str:
    img = Image.open(image_path)
    
    return transform(img, preprocess_image)

def transform(img: Image, preprocess_image: bool = True) -> str:
    if preprocess_image:
        img = preprocess(img)
 
    text = pytesseract.image_to_string(
        img,
        lang="mkd+eng",
        config="--psm 3 --oem 3",
    )
    return text.strip()