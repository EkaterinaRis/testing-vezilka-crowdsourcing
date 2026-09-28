import sys
import argparse
from pathlib import Path
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
from image_to_text import transform

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="OCR an image containing Macedonian/English text.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("image", type=Path, help="Path to the input image.")
    parser.add_argument(
        "output",
        nargs="?",
        type=Path,
        default=None,
        help="Path to write the text output (default: <image>.txt).",
    )
    parser.add_argument(
        "--no-preprocess",
        action="store_true",
        help="Skip image pre-processing (use on already-clean images).",
    )
    parser.add_argument(
        "--print",
        dest="print_result",
        action="store_true",
        help="Also print the extracted text to stdout.",
    )
    return parser.parse_args()
 
 
def main() -> None:
    args = parse_args()
 
    image_path: Path = args.image.resolve()
    if not image_path.exists():
        sys.exit(f"Error: file not found: {image_path}")
 
    output_path: Path = (
        args.output.resolve()
        if args.output
        else image_path.with_suffix(".txt")
    )
 
    print(f"Processing: {image_path}")
 
    try:
        version = pytesseract.get_tesseract_version()
        print(f"Tesseract version: {version}")
    except pytesseract.TesseractNotFoundError:
        sys.exit(
            "Tesseract not found. Install it and make sure it is on your PATH.\n"
        )
 
    available_langs = pytesseract.get_languages()
    missing = [l for l in ("mkd", "eng") if l not in available_langs]
    if missing:
        sys.exit(
            f"Missing Tesseract language pack(s): {', '.join(missing)}\n"
        )
 
    text = transform(image_path, preprocess_image=not args.no_preprocess)
 
    output_path.write_text(text, encoding="utf-8")
    print(f"Text saved to: {output_path}")
 
    if args.print_result:
        print("\n── Extracted text ──────────────────────────────────────\n")
        print(text)
        print("\n────────────────────────────────────────────────────────")
 
 
if __name__ == "__main__":
    main()