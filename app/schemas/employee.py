from datetime import date
from typing import List, Optional
from pydantic import BaseModel, EmailStr

class EmployeeBase(BaseModel):
    first_name: Optional[str] = None
    last_name: str
    birth_date: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    role: str
    department: Optional[str] = None
    salary: Optional[float] = None

class EmployeeCreate(EmployeeBase):
    skill_ids: List[int] = []

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    role: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[float] = None
    skill_ids: Optional[List[int]] = None

class Skill(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class Employee(EmployeeBase):
    id: int
    skills: List[Skill] = []

    class Config:
        from_attributes = True