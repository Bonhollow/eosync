from pydantic import BaseModel
from typing import Optional

class AssignmentBase(BaseModel):
    employee_id: int
    task_id: int
    assigned_hours: Optional[float]
    role_on_task: Optional[str]

class AssignmentCreate(AssignmentBase):
    pass

class Assignment(AssignmentBase):
    class Config:
        from_attributes = True