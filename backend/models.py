import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from database import Base


def gen_id():
    return str(uuid.uuid4())


class PatientSession(Base):
    """One row per patient intake session — mirrors script.js's `state` object."""
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=gen_id)
    created_at = Column(DateTime, default=datetime.utcnow)

    consented = Column(Boolean, default=False)
    consented_at = Column(DateTime, nullable=True)

    patient_name = Column(String, nullable=True)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)
    patient_phone = Column(String, nullable=True)

    selected_problem = Column(String, nullable=True)
    patient_answers = Column(JSON, default=dict)   # {question_id: {value, label}}
    ayush_answers = Column(JSON, default=dict)      # {param_id: value}

    urgent_flag = Column(JSON, nullable=True)        # {rule, reason} or null

    physician_verified = Column(Boolean, default=False)
    physician_reviewed = Column(Boolean, default=False)

    documents = relationship("Document", back_populates="session", cascade="all, delete-orphan")
    summary = relationship("Summary", back_populates="session", uselist=False, cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=gen_id)
    session_id = Column(String, ForeignKey("sessions.id"))
    filename = Column(String)
    content_type = Column(String, nullable=True)
    storage_path = Column(String)
    extracted_data = Column(JSON, nullable=True)  # real OCR output goes here later
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("PatientSession", back_populates="documents")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=gen_id)
    session_id = Column(String, ForeignKey("sessions.id"), unique=True)
    concern_title = Column(String, nullable=True)
    rows = Column(JSON, default=list)
    guidance = Column(JSON, nullable=True)
    ayush = Column(JSON, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("PatientSession", back_populates="summary")
