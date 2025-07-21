from datetime import date
from typing import Optional
from pydantic import BaseModel

class ProjectBase(BaseModel):
    title: str
    description: Optional[str]
    start_date: date
    end_date: Optional[date]
    budget_total: float

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    class Config:
        from_attributes = True