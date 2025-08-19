from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date, datetime
from agno.agent import Agent
from agno.models.google import Gemini
from core.config import settings
import enum

class TaskStatus(str, enum.Enum):
    TODO = 'To Do'
    IN_PROGRESS = 'In Progress'
    DONE = 'Done'

class Task(BaseModel):
    title: str = Field(..., description="The specific, actionable title of the task.")
    description: Optional[str] = Field(None, description="A brief description of what the task entails.")
    start_date: Optional[date] = Field(None, description="The calculated start date of the task.")
    end_date: Optional[date] = Field(None, description="The calculated end date of the task, based on effort.")
    estimated_hours: Optional[float] = Field(None, description="The estimated hours required to complete the task.")
    status: TaskStatus = Field(TaskStatus.TODO, description="The current status of the task, defaults to 'To Do'.")

class Project(BaseModel):
    title: str = Field(..., description="The descriptive title of the project.")
    description: Optional[str] = Field(None, description="A detailed summary of the project's goals and scope.")
    start_date: Optional[date] = Field(None, description="The start date of the project. Defaults to today if not specified.")
    end_date: Optional[date] = Field(None, description="The final end date of the project, determined by the last task.")
    budget_total: Optional[float] = Field(None, description="The total budget for the project. Null if not specified.")
    tasks: List[Task] = Field([], description="A comprehensive list of tasks required to complete the project.")

MODEL_API_KEY = settings.MODEL_API_KEY
MODEL_NAME = settings.MODEL_NAME

today_date_str = datetime.utcnow().strftime('%Y-%m-%d')

agent = Agent(
    model=Gemini(id=MODEL_NAME, api_key=MODEL_API_KEY),
    response_model=Project,
    instructions=f"""
You are an expert AI project planner. Your task is to take a user's brief project idea and transform it into a detailed, structured project plan.

Follow these rules precisely:
1.  **Analyze the Core Request**: Create a clear, descriptive `title` and `description` for the project based on the user's input.
2.  **Determine Project Timeline**:
    -   If the user does not specify a start date, you MUST use today's date as the `start_date`. Today's date is {today_date_str}.
    -   The project's overall `end_date` will be determined by the end date of the final task.
3.  **Generate Comprehensive Tasks**:
    -   Break down the project into a logical sequence of detailed tasks from start to finish. The tasks should cover all major phases (e.g., planning, design, development, testing, deployment).
    -   For each task, provide a clear `title` and assign a realistic `estimated_hours`.
4.  **Schedule the Tasks**:
    -   The `start_date` of the first task should be the project's `start_date`.
    -   Calculate each task's `end_date` based on its `start_date` and `estimated_hours`. Assume a standard 8-hour workday and that tasks are done sequentially.
    -   The `start_date` for each subsequent task must be the `end_date` of the previous task.
5.  **Budget**: If no budget is mentioned, the `budget_total` must be deducted from the effort required by the various tasks.
6.  **Final Output**: Your final response MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not add any extra text or explanations outside of the JSON structure.
"""
)