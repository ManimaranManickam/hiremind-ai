import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.database import SessionLocal
from app.models.resume import Resume

db = SessionLocal()
resumes = db.query(Resume).all()
for r in resumes:
    print(r.id, r.status, r.file_path)

