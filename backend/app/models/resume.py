from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, default="HireMind Corp")
    location = Column(String, default="Remote")
    salary_range = Column(String, default="Competitive")
    description = Column(String, nullable=False)
    requirements = Column(JSON)  # List of required skills
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resumes = relationship("Resume", back_populates="job_posting")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String)
    email = Column(String)
    phone = Column(String)
    file_path = Column(String, nullable=False)

    # Processing status: pending | processing | completed | failed
    status = Column(String, default="pending")

    # AI Analysis Results
    parsed_skills = Column(JSON)
    experience_summary = Column(String)
    ats_score = Column(Float)
    match_score = Column(Float)
    matching_skills = Column(JSON)
    missing_skills = Column(JSON)
    strengths = Column(JSON)
    weaknesses = Column(JSON)
    recommendation = Column(String)

    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=True)
    job_posting = relationship("JobPosting", back_populates="resumes")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
