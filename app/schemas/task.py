from datetime import date
from typing import Optional, List
from pydantic import BaseModel
from models.task import TaskStatus
from schemas.assignment import Assignment

class TaskCore(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    status: Optional[TaskStatus] = TaskStatus.TODO

class TaskCreate(TaskCore):
    pass

class Task(TaskCore):
    id: int
    project_id: int
    assignments: List[Assignment] = []

    class Config:
        from_attributes = True