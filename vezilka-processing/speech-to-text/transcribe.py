import argparse
import sys
import os
import time
import whisper
 
def transcribe(audio_path: str, model_name: str = "medium", language: str = "mk", output_path: str = None): 
    if not os.path.exists(audio_path):
        print(f"Error: File not found: {audio_path}")
        sys.exit(1)
 
    print(f"Loading Whisper model '{model_name}'... (downloads on first use)")
    model = whisper.load_model(model_name)
 
    lang_label = "Macedonian" if language == "mk" else language
    print(f"Transcribing '{audio_path}' in {lang_label}...")
    start = time.time()
    
    result = model.transcribe(
        audio_path,
        language=language,
        task="transcribe",
        verbose=False,
        fp16=False,
    )
 
    elapsed = time.time() - start
    text = result["text"].strip()
    detected_lang = result.get("language", "unknown")
 
    print(f"\nDone in {elapsed:.1f}s — detected language: {detected_lang}")
    print("\n" + "=" * 60)
    print(text)
    print("=" * 60)
 
    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"\nSaved to: {output_path}")
    else:
        default_out = os.path.splitext(audio_path)[0] + "_transcript.txt"
        with open(default_out, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"\nSaved to: {default_out}")
 
    return text
 
 
def main():
    parser = argparse.ArgumentParser(
        description="Transcribe an audio file to text (Macedonian and other languages)."
    )
    parser.add_argument("audio", help="Path to the audio file (mp3, wav, m4a, ogg, flac, etc.)")
    parser.add_argument(
        "--model",
        default="medium",
        choices=["tiny", "base", "small", "medium", "large", "large-v2", "large-v3"],
        help=(
            "Whisper model size. Larger = more accurate but slower.\n"
            "  tiny   (~75 MB)  — very fast, lower accuracy\n"
            "  base   (~145 MB) — fast\n"
            "  small  (~461 MB) — good balance\n"
            "  medium (~1.5 GB) — recommended for Macedonian (default)\n"
            "  large  (~3 GB)   — best accuracy, slow on CPU"
        ),
    )
    parser.add_argument(
        "--language",
        default="mk",
        help="Language code (default: mk for Macedonian). Use 'auto' to auto-detect.",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Output .txt file path (default: same name as audio with _transcript.txt suffix).",
    )
 
    args = parser.parse_args()
    language = None if args.language == "auto" else args.language
    transcribe(args.audio, args.model, language, args.output)
 
 
if __name__ == "__main__":
    main()