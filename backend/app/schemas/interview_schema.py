from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class InterviewAnswer(BaseModel):
    question: str
    transcript: str


class InterviewStartRequest(BaseModel):
    job_id: int
    resume_id: Optional[int] = None


class InterviewSubmitRequest(BaseModel):
    answers: List[InterviewAnswer]
    terminated: bool = False
    termination_reason: Optional[str] = None


class InterviewResponse(BaseModel):
    id: int
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_posting_id: Optional[int] = None
    resume_id: Optional[int] = None
    questions: Optional[List[str]] = None
    status: str
    cheating_detected: Optional[bool] = None
    termination_reason: Optional[str] = None
    communication_score: Optional[float] = None
    technical_score: Optional[float] = None
    cultural_fit_score: Optional[float] = None
    overall_score: Optional[float] = None
    overall_recommendation: Optional[str] = None
    key_strengths: Optional[List[str]] = None
    areas_to_improve: Optional[List[str]] = None
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
