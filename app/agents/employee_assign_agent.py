from typing import List, Optional
from pydantic import BaseModel, Field
from agno.agent import Agent
from agno.models.google import Gemini
from core.config import settings

MODEL_API_KEY = settings.MODEL_API_KEY
MODEL_NAME = settings.MODEL_NAME

class AssignmentCreate(BaseModel):
    employee_id: int = Field(..., description="The ID of the employee being assigned.")
    task_id: int = Field(..., description="The ID of the task to which the employee is assigned.")
    role_on_task: Optional[str] = Field(None, description="The specific role the employee will have on this task (e.g., 'Lead Developer', 'Tester').")
    assigned_hours: Optional[float] = Field(None, description="The estimated hours for the task.") 

class AssignmentList(BaseModel):
    assignments: List[AssignmentCreate] = Field(..., description="Una lista completa delle assegnazioni dipendente-task per il progetto.")


agent = Agent(
    model=Gemini(id=MODEL_NAME, api_key=MODEL_API_KEY),
    response_model=AssignmentList,
    instructions="Your goal is to act as an experienced Project Manager. You will be provided with project details, " \
        "including a list of tasks and a list of available employees with their skills. " \
        "Your job is to analyze this information and assign the most suitable employee(s) to each task. " \
        "For each task, find the employee whose skills best match the required ones. " \
        "Try to distribute the workload fairly if possible, but the absolute priority is the skill match. " \
        "Provide the final output as a structured list of assignments according to the given schema."
    )   
