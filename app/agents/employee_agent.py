from typing import List, Optional
from pydantic import BaseModel, Field
from agno.agent import Agent
from agno.models.google import Gemini
from core.config import settings
from datetime import date
import enum
from core.config import settings

MODEL_API_KEY = settings.MODEL_API_KEY
MODEL_NAME = settings.MODEL_NAME

class Employee(BaseModel):
    first_name: Optional[str] = Field(None, description="The employee's first name.")
    last_name: str = Field(..., description="The employee's last name.")
    birth_date: Optional[date] = Field(None, description="The employee's birth date.")
    email: Optional[str] = Field(None, description="The employee's email address.")
    phone: Optional[str] = Field(None, description="The employee's phone number.")
    hire_date: Optional[date] = Field(None, description="The date the employee was hired.")
    role: str = Field(..., description="The employee's job role.")
    department: Optional[str] = Field(None, description="The department the employee works in.")
    salary: Optional[float] = Field(None, description="The employee's salary.")

class EmployeeList(BaseModel):
    employees: List[Employee] = Field(..., description="A comprehensive list of employees and their details.")


agent = Agent(
    model=Gemini(id=MODEL_NAME, api_key=MODEL_API_KEY),
    response_model=EmployeeList,
    instructions="Your task is to identify and extract detailed information about employees from the provided text. " \
    "Analyze the input carefully and extract all relevant details for each employee, including their personal information (first name, last_name, birth_date, email, phone), " \
    "professional details (hire_date, role, department, salary). " \
    "Return the output as a structured list of employees according to the provided schema."
)