from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, resume, jobs, interviews
from app.database import engine, Base, SessionLocal
from app.models.resume import JobPosting
from app.models.interview import Interview  # noqa: ensure table is created
from app.models.user import User
from app.auth.security import get_password_hash

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HireMind AI",
    description="Autonomous AI Recruitment Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(interviews.router)


def seed_data():
    """Seed demo users and job postings on startup."""
    db = SessionLocal()
    try:
        # Seed HR admin
        if not db.query(User).filter(User.email == "hr@hiremind.ai").first():
            hr = User(
                email="hr@hiremind.ai",
                full_name="Alex HR Manager",
                hashed_password=get_password_hash("admin123"),
                is_admin=True
            )
            db.add(hr)

        # Seed candidate
        if not db.query(User).filter(User.email == "candidate@hiremind.ai").first():
            candidate = User(
                email="candidate@hiremind.ai",
                full_name="Jordan Smith",
                hashed_password=get_password_hash("candidate123"),
                is_admin=False
            )
            db.add(candidate)

        # Seed job postings
        if db.query(JobPosting).count() == 0:
            jobs_data = [
                JobPosting(
                    title="Senior Full Stack Engineer",
                    company="Aabasoft Technologies",
                    location="Kochi, India (Hybrid)",
                    salary_range="₹18,00,000 – ₹25,00,000",
                    description="We are looking for a talented Senior Full Stack Engineer to join our product team. You'll build scalable web applications, mentor junior developers, and collaborate with product managers to define technical requirements.",
                    requirements=["React", "Python", "FastAPI", "PostgreSQL", "Docker", "System Architecture"]
                ),
                JobPosting(
                    title="Cloud Solutions Architect",
                    company="Aabasoft Technologies",
                    location="Remote (India)",
                    salary_range="₹25,00,000 – ₹35,00,000",
                    description="Join our infrastructure team to design and implement highly available and secure cloud solutions. You will work closely with enterprise clients to migrate legacy systems to AWS and Azure.",
                    requirements=["AWS", "Azure", "Kubernetes", "Terraform", "CI/CD", "Security Compliance"]
                ),
                JobPosting(
                    title="Marketing Director",
                    company="Aabasoft Technologies",
                    location="Dubai, UAE",
                    salary_range="AED 350,000 - AED 450,000",
                    description="We are seeking an experienced Marketing Director to lead our global B2B marketing initiatives. You will develop comprehensive go-to-market strategies and manage a cross-functional marketing team.",
                    requirements=["B2B Marketing", "Strategy", "Leadership", "Digital Marketing", "Market Research", "Brand Management"]
                ),
                JobPosting(
                    title="Human Resources Business Partner",
                    company="Aabasoft Technologies",
                    location="Bangalore, India",
                    salary_range="₹15,00,000 – ₹20,00,000",
                    description="Partner with business leaders to develop and execute HR strategies focused on talent management, organizational effectiveness, workforce planning, and employee engagement.",
                    requirements=["HR Strategy", "Talent Management", "Employee Relations", "Performance Management", "Labor Laws"]
                ),
                JobPosting(
                    title="Senior Financial Analyst",
                    company="Aabasoft Technologies",
                    location="Kochi, India",
                    salary_range="₹12,00,000 – ₹18,00,000",
                    description="Conduct complex financial analysis, build forecasting models, and provide actionable insights to executive leadership. You will play a key role in annual budgeting and strategic planning.",
                    requirements=["Financial Modeling", "Forecasting", "Data Analysis", "Excel", "ERP Systems", "Corporate Finance"]
                ),
                JobPosting(
                    title="Data Scientist",
                    company="Aabasoft Technologies",
                    location="Pune, India (Hybrid)",
                    salary_range="₹20,00,000 – ₹28,00,000",
                    description="Develop predictive models and machine learning algorithms to solve complex business problems. You will work with large datasets to extract meaningful insights that drive product strategy.",
                    requirements=["Python", "Machine Learning", "SQL", "TensorFlow", "Data Visualization", "Statistics"]
                ),
                JobPosting(
                    title="Operations Manager",
                    company="Aabasoft Technologies",
                    location="Chennai, India",
                    salary_range="₹14,00,000 – ₹22,00,000",
                    description="Oversee daily operations, optimize processes for maximum efficiency, and ensure seamless delivery of IT services to our global clients.",
                    requirements=["Operations Management", "Process Optimization", "Leadership", "Six Sigma", "Vendor Management"]
                ),
                JobPosting(
                    title="Quality Assurance Engineer",
                    company="Aabasoft Technologies",
                    location="Remote (India)",
                    salary_range="₹8,00,000 – ₹14,00,000",
                    description="Ensure the quality of our software products through rigorous automated and manual testing. You will design test plans, report bugs, and work closely with developers.",
                    requirements=["Automated Testing", "Selenium", "Manual Testing", "JIRA", "Python", "API Testing"]
                ),
                JobPosting(
                    title="Customer Success Executive",
                    company="Aabasoft Technologies",
                    location="Mumbai, India",
                    salary_range="₹6,00,000 – ₹10,00,000",
                    description="Be the primary point of contact for our enterprise clients, ensuring their success with our platforms, driving adoption, and facilitating renewals.",
                    requirements=["Communication", "Client Relationship", "CRM", "Problem Solving", "Account Management"]
                ),
                JobPosting(
                    title="Legal Counsel",
                    company="Aabasoft Technologies",
                    location="New Delhi, India",
                    salary_range="₹18,00,000 – ₹26,00,000",
                    description="Provide legal advice on corporate matters, review contracts, manage intellectual property, and ensure regulatory compliance across multiple jurisdictions.",
                    requirements=["Corporate Law", "Contract Drafting", "IP Law", "Compliance", "Negotiation", "Risk Management"]
                ),
            ]
            db.add_all(jobs_data)

        db.commit()
        print("✅ Demo data seeded successfully")
    except Exception as e:
        print(f"❌ Seeding error: {e}")
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    seed_data()


@app.get("/")
def read_root():
    return {"message": "Welcome to HireMind AI Backend API", "version": "1.0.0"}
