from typing import Any


def generate_clinical_summary(
    patient: dict[str, Any],
    concern: str | None,
    answers: dict[str, Any],
    ayush_answers: dict[str, Any],
    documents: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Build a structured, physician-facing summary from collected information.

    This is a deterministic formatter.
    It does not diagnose conditions or recommend treatment.
    """

    # ---------------------------------------------------------
    # Patient information
    # ---------------------------------------------------------

    patient_section = {
        "name": patient.get("name"),
        "age": patient.get("age"),
        "gender": patient.get("gender"),
        "phone": patient.get("phone"),
    }

    # ---------------------------------------------------------
    # Questionnaire answers
    # ---------------------------------------------------------

    questionnaire = []

    for question_id, answer in answers.items():
        if isinstance(answer, dict):
            questionnaire.append(
                {
                    "question_id": question_id,
                    "answer": answer.get(
                        "label",
                        answer.get("value")
                    ),
                }
            )
        else:
            questionnaire.append(
                {
                    "question_id": question_id,
                    "answer": answer,
                }
            )

    # ---------------------------------------------------------
    # Document information
    # ---------------------------------------------------------

    document_sections = []

    for document in documents:
        extracted_data = document.get("extracted_data") or {}

        medical_information = extracted_data.get(
            "medical_information",
            {}
        )

        document_sections.append(
            {
                "filename": document.get("filename"),
                "ocr_status": extracted_data.get("status"),
                "patient_name": medical_information.get("patient_name"),
                "date": medical_information.get("date"),
                "medicines": medical_information.get(
                    "medicines",
                    []
                ),
                "dosages": medical_information.get(
                    "dosages",
                    []
                ),
                "frequencies": medical_information.get(
                    "frequencies",
                    []
                ),
                "manufacturer": medical_information.get(
                    "manufacturer"
                ),
                "expiry_date": medical_information.get(
                    "expiry_date"
                ),
                "lot_number": medical_information.get(
                    "lot_number"
                ),
            }
        )

    # ---------------------------------------------------------
    # AYUSH information
    # ---------------------------------------------------------

    ayush_section = []

    for parameter_id, answer in ayush_answers.items():
        if isinstance(answer, dict):
            value = answer.get(
                "label",
                answer.get("value")
            )
        else:
            value = answer

        ayush_section.append(
            {
                "parameter_id": parameter_id,
                "value": value,
            }
        )

    # ---------------------------------------------------------
    # Final summary
    # ---------------------------------------------------------

    return {
        "summary_type": "structured_clinical_summary",

        "patient": patient_section,

        "presenting_concern": concern,

        "questionnaire": questionnaire,

        "documents": document_sections,

        "ayush": ayush_section,

        "disclaimer": (
            "This summary organizes information provided by the "
            "patient and extracted from uploaded documents. "
            "OCR results may contain recognition errors and "
            "should be verified against the original document. "
            "This summary is not a diagnosis."
        ),
    }
if __name__ == "__main__":
    import json

    sample = generate_clinical_summary(
        patient={
            "name": "Test Patient",
            "age": 25,
            "gender": "Male",
            "phone": "0000000000",
        },
        concern="fever",
        answers={
            "duration": {
                "value": "3",
                "label": "3 days",
            },
            "severity": {
                "value": "moderate",
                "label": "Moderate",
            },
        },
        ayush_answers={
            "appetite": {
                "value": "normal",
                "label": "Normal",
            }
        },
        documents=[
            {
                "filename": "test_prescription.webp",
                "extracted_data": {
                    "status": "completed",
                    "medical_information": {
                        "patient_name": "John R Doe",
                        "date": "23 JAN99",
                        "medicines": [
                            "Tr Belladonna",
                            "Amphogel gsad",
                        ],
                        "dosages": [
                            "15me",
                            "120me",
                        ],
                        "frequencies": [
                            "tid",
                            "a.c.",
                        ],
                        "manufacturer": "Wyeth",
                        "expiry_date": "12/02",
                        "lot_number": "P39K106",
                    },
                },
            }
        ],
    )

    print(json.dumps(sample, indent=2))