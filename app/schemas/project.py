from datetime import date
from typing import Optional, List
from pydantic import BaseModel
from .task import Task as TaskSchema, TaskCreate

class ProjectBase(BaseModel):
    title: str
    description: Optional[str]
    start_date: date
    end_date: Optional[date]
    budget_total: Optional[float] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectWithTasksCreate(ProjectBase):
    tasks: List[TaskCreate] = []

class Project(ProjectBase):
    id: int
    tasks: List[TaskSchema] = []

    class Config:
        from_attributes = True