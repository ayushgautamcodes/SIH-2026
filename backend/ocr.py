import json
from pathlib import Path
from typing import Any

import os

os.environ["FLAGS_enable_pir_api"] = "0"

from paddleocr import PaddleOCR


# OCR engine is created only when it is first needed.
_ocr_engine = None


def get_ocr_engine() -> PaddleOCR:
    global _ocr_engine

    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(
    lang="en",
    enable_mkldnn=False
)

    return _ocr_engine

def extract_text_from_document(file_path: str) -> dict[str, Any]:
    """
    Run PaddleOCR on an image or PDF and return structured OCR data.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    ocr = get_ocr_engine()

    results = ocr.predict(str(path))

    lines = []

    for result in results:
        data = result.json

        if isinstance(data, str):
            data = json.loads(data)

        res = data.get("res", data)

        texts = res.get("rec_texts", [])
        scores = res.get("rec_scores", [])

        for index, text in enumerate(texts):
            score = scores[index] if index < len(scores) else None

            lines.append(
                {
                    "text": text,
                    "confidence": score,
                }
            )

    full_text = "\n".join(
        item["text"]
        for item in lines
        if item["text"].strip()
    )

    return {
        "status": "completed",
        "text": full_text,
        "lines": lines,
    }

if __name__ == "__main__":
    test_file = Path(__file__).resolve().parent / "uploads" / "test_prescription.webp"
    result = extract_text_from_document(str(test_file))

    print("\n========== OCR RESULT ==========\n")
    print(result["text"])

    print("\n========== CONFIDENCE ==========\n")
    for line in result["lines"]:
        print(f'{line["confidence"]}: {line["text"]}')