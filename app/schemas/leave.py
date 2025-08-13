from datetime import date
from typing import Optional
from pydantic import BaseModel
from models.leave import LeaveType
from .employee import Employee

class LeaveBase(BaseModel):
    type: LeaveType
    start_date: date
    end_date: date
    reason: Optional[str]

class LeaveCreate(LeaveBase):
    employee_id: int

class LeaveUpdate(BaseModel):
    type: Optional[LeaveType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    approved: Optional[bool] = None
    reason: Optional[str] = None

class Leave(LeaveBase):
    id: int
    approved: bool
    employee: Employee

    class Config:
        from_attributes = True