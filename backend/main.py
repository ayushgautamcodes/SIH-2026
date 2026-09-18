import os
import shutil
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import PatientSession, Document, Summary
import schemas
from red_flags import check_urgent_symptoms
from ocr import extract_text_from_document
from medical_extractor import extract_medical_information
from summary_generator import generate_clinical_summary

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RoG-उपाttam API")

# During dev, allow the static frontend (any origin/port) to call this API.
# Lock this down to your actual frontend origin before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mirrors guidanceByConcern in script.js — add the rest of your CONCERNS here.
GUIDANCE_BY_CONCERN = {
    "fever": {
        "en": "Fever can have many causes. Please monitor your symptoms and consult "
              "a healthcare professional if they are severe, persistent, or worsening.",
        "hi": "बुखार के कई कारण हो सकते हैं। लक्षणों पर नज़र रखें और यदि वे गंभीर हों तो सलाह लें।",
    },
    "chest": {
        "en": "Chest discomfort can have several causes. Please consult a healthcare "
              "professional promptly for assessment.",
        "hi": "सीने में बेचैनी के कई कारण हो सकते हैं। शीघ्र स्वास्थ्य पेशेवर से परामर्श करें।",
    },
    "other": {
        "en": "Thank you for describing your concern. Please consult a healthcare "
              "professional for further evaluation.",
        "hi": "अपनी समस्या बताने के लिए धन्यवाद। आगे के मूल्यांकन के लिए परामर्श करें।",
    },
}


def get_session_or_404(session_id: str, db: Session) -> PatientSession:
    s = db.query(PatientSession).filter(PatientSession.id == session_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return s


@app.post("/api/sessions", response_model=schemas.SessionOut)
def create_session(db: Session = Depends(get_db)):
    session = PatientSession()
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@app.post("/api/sessions/{session_id}/consent", response_model=schemas.SessionOut)
def give_consent(session_id: str, db: Session = Depends(get_db)):
    s = get_session_or_404(session_id, db)
    s.consented = True
    s.consented_at = datetime.utcnow()
    db.commit()
    db.refresh(s)
    return s


@app.put("/api/sessions/{session_id}/patient", response_model=schemas.SessionOut)
def update_patient(session_id: str, body: schemas.PatientDetails, db: Session = Depends(get_db)):
    s = get_session_or_404(session_id, db)
    if body.name is not None:
        s.patient_name = body.name
    if body.age is not None:
        s.patient_age = body.age
    if body.gender is not None:
        s.patient_gender = body.gender
    if body.phone is not None:
        s.patient_phone = body.phone
    db.commit()
    db.refresh(s)
    return s


@app.put("/api/sessions/{session_id}/concern", response_model=schemas.SessionOut)
def set_concern(session_id: str, body: schemas.ConcernUpdate, db: Session = Depends(get_db)):
    s = get_session_or_404(session_id, db)
    s.selected_problem = body.problem
    db.commit()
    db.refresh(s)
    return s


@app.put("/api/sessions/{session_id}/answers", response_model=schemas.SessionOut)
def save_answers(session_id: str, body: schemas.AnswersUpdate, db: Session = Depends(get_db)):
    s = get_session_or_404(session_id, db)
    s.patient_answers = body.answers

    # Re-run red-flag check server-side every time answers change.
    flag = check_urgent_symptoms(s.selected_problem or "", body.answers)
    s.urgent_flag = flag

    db.commit()
    db.refresh(s)
    return s


@app.put("/api/sessions/{session_id}/ayush", response_model=schemas.SessionOut)
def save_ayush(session_id: str, body: schemas.AyushUpdate, db: Session = Depends(get_db)):
    s = get_session_or_404(session_id, db)
    s.ayush_answers = body.answers
    db.commit()
    db.refresh(s)
    return s


@app.post("/api/sessions/{session_id}/documents")
def upload_document(
    session_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    s = get_session_or_404(session_id, db)

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported document type. Please upload JPG, PNG, WEBP, or PDF."
        )

    dest_path = os.path.join(
        UPLOAD_DIR,
        f"{session_id}_{file.filename}"
    )

    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        ocr_result = extract_text_from_document(dest_path)

        medical_data = extract_medical_information(
            ocr_result.get("text", "")
        )

        extracted_data = {
            "status": "completed",
            "ocr": ocr_result,
            "medical_information": medical_data,
        }

    except Exception as e:
        extracted_data = {
            "status": "ocr_failed",
            "error": str(e),
        }

    doc = Document(
        session_id=session_id,
        filename=file.filename,
        content_type=file.content_type,
        storage_path=dest_path,
        extracted_data=extracted_data,
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "id": doc.id,
        "filename": doc.filename,
        "extracted_data": doc.extracted_data,
    }

@app.post("/api/sessions/{session_id}/summary")
def generate_summary(session_id: str, db: Session = Depends(get_db)):
    s = get_session_or_404(session_id, db)

    documents = [
        {
            "filename": doc.filename,
            "extracted_data": doc.extracted_data,
        }
        for doc in s.documents
    ]

    patient = {
        "name": s.patient_name,
        "age": s.patient_age,
        "gender": s.patient_gender,
        "phone": s.patient_phone,
    }

    summary_data = generate_clinical_summary(
        patient=patient,
        concern=s.selected_problem,
        answers=s.patient_answers or {},
        ayush_answers=s.ayush_answers or {},
        documents=documents,
    )

    existing = (
        db.query(Summary)
        .filter(Summary.session_id == session_id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()

    summary = Summary(
        session_id=session_id,
        concern_title=s.selected_problem,
        rows=summary_data["questionnaire"],
        guidance=GUIDANCE_BY_CONCERN.get(
            s.selected_problem,
            GUIDANCE_BY_CONCERN["other"]
        ),
        ayush=summary_data["ayush"],
    )

    db.add(summary)

    s.physician_verified = False
    s.physician_reviewed = False

    db.commit()
    db.refresh(summary)

    return {
        "id": summary.id,
        "session_id": summary.session_id,
        "generated_at": summary.generated_at,
        "summary": summary_data,
        "guidance": summary.guidance,
    }


@app.get("/api/sessions/{session_id}/summary")
def get_summary(session_id: str, db: Session = Depends(get_db)):
    summary = db.query(Summary).filter(Summary.session_id == session_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="No summary generated yet")
    return summary.__dict__


@app.post("/api/sessions/{session_id}/physician-review", response_model=schemas.SessionOut)
def physician_review(session_id: str, verified: bool = True, db: Session = Depends(get_db)):
    s = get_session_or_404(session_id, db)
    s.physician_reviewed = True
    s.physician_verified = verified
    db.commit()
    db.refresh(s)
    return s
