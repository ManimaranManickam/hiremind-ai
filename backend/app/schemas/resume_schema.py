from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ResumeBase(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    job_posting_id: Optional[int] = None

class ResumeResponse(ResumeBase):
    id: int
    file_path: str
    status: str
    parsed_skills: Optional[List[str]] = None
    experience_summary: Optional[str] = None
    ats_score: Optional[float] = None
    match_score: Optional[float] = None
    matching_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
