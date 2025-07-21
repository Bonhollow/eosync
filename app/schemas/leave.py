from datetime import date
from typing import Optional
from pydantic import BaseModel
from models.leave import LeaveType

class LeaveBase(BaseModel):
    employee_id: int
    type: LeaveType
    start_date: date
    end_date: date
    approved: Optional[bool] = False
    reason: Optional[str]

class LeaveCreate(LeaveBase):
    pass

class Leave(LeaveBase):
    id: int
    class Config:
        from_attributes = True