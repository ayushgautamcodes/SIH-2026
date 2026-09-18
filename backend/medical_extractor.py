import re
from typing import Any


def extract_medical_information(ocr_text: str) -> dict[str, Any]:
    """
    Convert raw OCR text into basic structured medical information.

    This is a rule-based first version.
    It does not make a diagnosis or provide medical advice.
    """

    lines = [
        line.strip()
        for line in ocr_text.splitlines()
        if line.strip()
    ]

    result = {
        "patient_name": None,
        "date": None,
        "medicines": [],
        "dosages": [],
        "frequencies": [],
        "manufacturer": None,
        "expiry_date": None,
        "lot_number": None,
        "raw_text": ocr_text,
    }

    # ---------------------------------------------------------
    # Date
    # ---------------------------------------------------------

    date_pattern = re.compile(
        r"\b\d{1,2}\s+[A-Z]{3}\s+\d{2,4}\b",
        re.IGNORECASE,
    )

    for line in lines:
        match = date_pattern.search(line)

        if match:
            result["date"] = match.group(0)
            break

    # ---------------------------------------------------------
    # Patient name
    # ---------------------------------------------------------

    for index, line in enumerate(lines):
        if line.upper().startswith("FOR"):
            if index + 1 < len(lines):
                possible_name = lines[index + 1]

                if possible_name:
                    result["patient_name"] = possible_name

            break

    # ---------------------------------------------------------
    # Manufacturer
    # ---------------------------------------------------------

    for index, line in enumerate(lines):
        if line.upper() == "MFGR:":
            if index + 1 < len(lines):
                result["manufacturer"] = lines[index + 1]

            break

    # ---------------------------------------------------------
    # Expiry date
    # ---------------------------------------------------------

    for index, line in enumerate(lines):
        if line.upper() == "EXP DATE:":
            if index + 1 < len(lines):
                result["expiry_date"] = lines[index + 1]

            break

    # ---------------------------------------------------------
    # Lot number
    # ---------------------------------------------------------

    for index, line in enumerate(lines):
        if line.upper() == "LOT NO:":
            if index + 1 < len(lines):
                result["lot_number"] = lines[index + 1]

            break

    # ---------------------------------------------------------
    # Medicine candidates
    # ---------------------------------------------------------

    for line in lines:
        upper = line.upper()

        if upper in {
            "DD",
            "FORM",
            "1289",
            "DOD PRESCRIPTION",
            "MEDICAL FACILITY",
            "DATE",
            "R(SUPERSCRIPTION)",
            "(INSCRIPTION)",
            "(SUBSCRIPTION)",
            "(SIGNA)",
            "MFGR:",
            "EXP DATE:",
            "LOT NO:",
            "FILLED BY:",
        }:
            continue

        if "BELLADONNA" in upper or "AMPHOGEL" in upper:
            result["medicines"].append(line)

    # ---------------------------------------------------------
    # Dosage candidates
    # ---------------------------------------------------------

    dosage_pattern = re.compile(
        r"\b\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|me)\b",
        re.IGNORECASE,
    )

    for line in lines:
        matches = dosage_pattern.findall(line)

        for match in matches:
            result["dosages"].append(match)

    # ---------------------------------------------------------
    # Frequency candidates
    # ---------------------------------------------------------

    frequency_pattern = re.compile(
        r"\b(?:once|twice|daily|tid|bid|qid|od|"
        r"q\d+h|a\.c\.|p\.c\.)\b",
        re.IGNORECASE,
    )

    for line in lines:
        matches = frequency_pattern.findall(line)

        for match in matches:
            result["frequencies"].append(match)

    return result
if __name__ == "__main__":
    sample_text = """
    DOD PRESCRIPTION
    John R Doe, HM3, USN
    23 JAN99
    Tr Belladonna
    15me
    Amphogel gsad
    120me
    MFGR:
    Wyeth
    EXP DATE:
    12/02
    LOT NO:
    P39K106
    """

    result = extract_medical_information(sample_text)

    import json

    print(json.dumps(result, indent=2))