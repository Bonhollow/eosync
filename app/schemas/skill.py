from pydantic import BaseModel

class SkillBase(BaseModel):
    name: str

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: str
    
class Skill(SkillBase):
    id: int
    class Config:
        from_attributes = True