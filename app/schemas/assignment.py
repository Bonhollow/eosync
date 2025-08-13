from pydantic import BaseModel
from typing import Optional
from schemas.employee import Employee

class AssignmentBase(BaseModel):
    employee_id: int
    task_id: int
    assigned_hours: Optional[float]
    role_on_task: Optional[str]

class AssignmentCreate(AssignmentBase):
    pass

class Assignment(AssignmentBase):
    employee: Employee

    class Config:
        from_attributes = True