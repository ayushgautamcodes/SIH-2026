from typing import Optional, Dict, Any
from pydantic import BaseModel


class PatientDetails(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None


class ConcernUpdate(BaseModel):
    problem: str


class AnswersUpdate(BaseModel):
    answers: Dict[str, Any]  # {question_id: {value, label}}


class AyushUpdate(BaseModel):
    answers: Dict[str, Any]  # {param_id: value}


class SessionOut(BaseModel):
    id: str
    consented: bool
    patient_name: Optional[str]
    selected_problem: Optional[str]
    urgent_flag: Optional[dict]
    physician_verified: bool
    physician_reviewed: bool

    class Config:
        from_attributes = True
