from db.utils import *
from extract.extract import *
from transform.transforms import *

from datasets import Dataset
from dataclasses import asdict
from pathlib import Path
from itertools import chain
from datetime import datetime

import shutil

load_dotenv('../')

cache_dir = Path("./data/hf_cache_temp").resolve()
output_dir = Path("./data/dataset").resolve()

if cache_dir.exists():
    shutil.rmtree(cache_dir)

if output_dir.exists():
    shutil.rmtree(output_dir)

output_dir.mkdir(parents=True, exist_ok=True)
cache_dir.mkdir(parents=True, exist_ok=True)
if output_dir.exists():
    shutil.rmtree(output_dir)

def dataset_generator():
    conn = get_db_connection()

    try:
        text_image_iter = iter_text_and_image_data(conn)
        media_iter = iter_video_and_audio_with_transcription(conn)

        all_iter = chain(text_image_iter, media_iter)

        for file_row in all_iter:
            rows = process_file(file_row)

            if not rows:
                continue

            for row in rows:
                yield asdict(row)

    finally:
        conn.close()

dataset = Dataset.from_generator(dataset_generator, cache_dir=cache_dir)

username = os.getenv("HF_USERNAME")

timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
dataset_name = f"vezilka-crowd-sourcing-{timestamp}"

dataset.save_to_disk(str(output_dir))
dataset.push_to_hub(f'{username}/{dataset_name}')

shutil.rmtree(cache_dir, ignore_errors=True)