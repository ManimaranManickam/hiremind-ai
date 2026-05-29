from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal, get_db
from app.models.interview import Interview
from app.models.resume import Resume, JobPosting
from app.schemas.interview_schema import (
    InterviewStartRequest, InterviewSubmitRequest, InterviewResponse
)
from app.auth.deps import get_current_active_user
from app.models.user import User
from app.agents.interview_agent import generate_interview_questions, analyze_interview_transcript

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


def analyze_interview_background(interview_id: int, job_description: str):
    db = SessionLocal()
    try:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview or not interview.answers:
            return

        interview.status = "analyzing"
        db.commit()

        # Combine all Q&A into one transcript
        full_transcript = "\n\n".join(
            f"Q: {a['question']}\nA: {a['transcript']}"
            for a in interview.answers
        )

        result = analyze_interview_transcript(full_transcript, job_description)

        if result:
            interview.communication_score = result.get("communication_score")
            interview.technical_score = result.get("technical_score")
            interview.cultural_fit_score = result.get("cultural_fit_score")
            interview.overall_score = result.get("overall_score")
            interview.overall_recommendation = result.get("overall_recommendation")
            interview.key_strengths = result.get("key_strengths", [])
            interview.areas_to_improve = result.get("areas_to_improve", [])
            interview.feedback = result.get("feedback")
            interview.status = "completed"
        else:
            interview.status = "failed"

        db.commit()
    except Exception as e:
        print(f"Interview analysis error: {e}")
        try:
            interview = db.query(Interview).filter(Interview.id == interview_id).first()
            if interview:
                interview.status = "failed"
                db.commit()
        except:
            pass
    finally:
        db.close()


@router.post("/", response_model=InterviewResponse)
def start_interview(
    data: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get job info
    job = db.query(JobPosting).filter(JobPosting.id == data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get candidate skills from resume if available
    candidate_skills = []
    if data.resume_id:
        resume = db.query(Resume).filter(Resume.id == data.resume_id).first()
        if resume and resume.parsed_skills:
            candidate_skills = resume.parsed_skills

    # Generate questions using AI agent
    questions = generate_interview_questions(
        job_title=job.title,
        job_description=job.description,
        candidate_skills=candidate_skills,
        num_questions=5
    )

    interview = Interview(
        candidate_name=current_user.full_name,
        candidate_email=current_user.email,
        job_posting_id=data.job_id,
        resume_id=data.resume_id,
        questions=questions,
        status="pending"
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.post("/{interview_id}/submit", response_model=InterviewResponse)
def submit_interview(
    interview_id: int,
    data: InterviewSubmitRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview.answers = [a.model_dump() for a in data.answers]

    # Handle anti-cheat termination
    if data.terminated:
        interview.status = "terminated"
        interview.cheating_detected = True
        interview.termination_reason = data.termination_reason or "Policy violation"
        db.commit()
        db.refresh(interview)
        return interview

    interview.status = "analyzing"
    db.commit()
    db.refresh(interview)

    job_description = ""
    if interview.job_posting_id:
        job = db.query(JobPosting).filter(JobPosting.id == interview.job_posting_id).first()
        if job:
            job_description = job.description

    background_tasks.add_task(analyze_interview_background, interview_id, job_description)
    return interview


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@router.get("/by-resume/{resume_id}", response_model=InterviewResponse)
def get_interview_by_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    interview = db.query(Interview).filter(Interview.resume_id == resume_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="No interview found for this resume")
    return interview


@router.get("/", response_model=List[InterviewResponse])
def get_all_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(Interview).order_by(Interview.created_at.desc()).all()
