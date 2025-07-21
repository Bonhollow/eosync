from datetime import date
from typing import List, Optional
from pydantic import BaseModel, EmailStr

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    email: EmailStr
    phone: Optional[str]
    hire_date: date
    role: Optional[str]
    department: Optional[str]
    salary: float

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    birth_date: Optional[date]
    email: Optional[EmailStr]
    phone: Optional[str]
    hire_date: Optional[date]
    role: Optional[str]
    department: Optional[str]
    salary: Optional[float]

class Employee(EmployeeBase):
    id: int
    skills: List[str] = []
    class Config:
        from_attributes = True