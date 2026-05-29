from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: Optional[str] = "HireMind Corp"
    location: Optional[str] = "Remote"
    salary_range: Optional[str] = "Competitive"
    description: str
    requirements: Optional[List[str]] = []

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
