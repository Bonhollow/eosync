from datetime import date
from typing import Optional
from pydantic import BaseModel
from models.task import TaskStatus

class TaskBase(BaseModel):
    project_id: int
    title: str
    description: Optional[str]
    start_date: date
    end_date: Optional[date]
    estimated_hours: Optional[float]
    status: Optional[TaskStatus] = TaskStatus.TODO

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    class Config:
        from_attributes = True