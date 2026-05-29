from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String)
    candidate_email = Column(String)

    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)

    # Generated questions + recorded answers
    questions = Column(JSON)   # List[str]
    answers = Column(JSON)     # List[{"question": "...", "transcript": "..."}]

    # Status: pending | analyzing | completed | failed | terminated
    status = Column(String, default="pending")
    cheating_detected = Column(Boolean, default=False)
    termination_reason = Column(String, nullable=True)

    # AI scoring results
    communication_score = Column(Float)
    technical_score = Column(Float)
    cultural_fit_score = Column(Float)
    overall_score = Column(Float)
    overall_recommendation = Column(String)
    key_strengths = Column(JSON)
    areas_to_improve = Column(JSON)
    feedback = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
