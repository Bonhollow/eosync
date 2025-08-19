from typing import List
from pydantic import BaseModel, Field
from agno.agent import Agent
from agno.models.google import Gemini
from core.config import settings

MODEL_API_KEY = settings.MODEL_API_KEY
MODEL_NAME = settings.MODEL_NAME

class SkillList(BaseModel):
    skills: List[str] = Field(..., description="A list of professional skills")


agent = Agent(
    model=Gemini(id=MODEL_NAME, api_key=MODEL_API_KEY),
    response_model=SkillList,
    instructions="Your task is to identify and extract a list of professional skills from the provided text." \
    "Analyze the input carefully and list all the technical, soft, and transferable skills you can find. " \
    "Return the output as a structured list of strings."
)