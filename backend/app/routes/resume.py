import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal, get_db
from app.models.resume import Resume
from app.schemas.resume_schema import ResumeResponse
from app.auth.deps import get_current_active_user
from app.models.user import User
from app.agents.resume_agent import analyze_resume
from app.agents.scoring_agent import generate_candidate_score
from app.models.resume import JobPosting
from app.utils.file_parser import extract_text_from_file

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def process_resume_background(resume_id: int, file_path: str, job_description: str = ""):
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            return

        # Mark as processing
        resume.status = "processing"
        db.commit()

        # Step 1: AI resume analysis
        analysis = analyze_resume(file_path)

        if analysis:
            resume.parsed_skills = analysis.get("parsed_skills")
            resume.experience_summary = analysis.get("experience_summary")
            resume.ats_score = analysis.get("ats_score")
            resume.strengths = analysis.get("strengths")
            resume.weaknesses = analysis.get("weaknesses")
        else:
            resume.status = "failed"
            db.commit()
            return

        # Step 2: If we have a job description, score the match
        if job_description:
            try:
                resume_text = extract_text_from_file(file_path)
                scoring = generate_candidate_score(resume_text, job_description)
                if scoring:
                    resume.match_score = scoring.get("match_score")
                    resume.matching_skills = scoring.get("matching_skills")
                    resume.missing_skills = scoring.get("missing_skills")
                    resume.recommendation = scoring.get("recommendation")
            except Exception as e:
                print(f"Scoring error: {e}")

        resume.status = "completed"
        db.commit()

    except Exception as e:
        print(f"Background processing error: {e}")
        try:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if resume:
                resume.status = "failed"
                db.commit()
        except:
            pass
    finally:
        db.close()


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    job_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    allowed = ('.pdf', '.docx', '.doc')
    if not any(file.filename.lower().endswith(ext) for ext in allowed):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    safe_name = file.filename.replace(" ", "_")
    file_location = f"{UPLOAD_DIR}/{current_user.id}_{safe_name}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Get job description for matching if job_id provided
    job_description = ""
    if job_id:
        job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
        if job:
            job_description = job.description

    new_resume = Resume(
        file_path=file_location,
        candidate_name=current_user.full_name,
        email=current_user.email,
        status="pending",
        job_posting_id=job_id
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Trigger background AI analysis
    background_tasks.add_task(
        process_resume_background,
        new_resume.id,
        file_location,
        job_description
    )

    return new_resume


@router.get("/", response_model=List[ResumeResponse])
def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(Resume).order_by(Resume.created_at.desc()).all()


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume
