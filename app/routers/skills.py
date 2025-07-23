from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.skill import Skill as SkillModel
from schemas.skill import SkillCreate, Skill as SkillSchema

router = APIRouter()

@router.post("/", response_model=SkillSchema)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db)):
    db_skill = SkillModel(**skill.dict())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.get("/", response_model=List[SkillSchema])
def read_skills(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(SkillModel).offset(skip).limit(limit).all()

@router.delete("/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(SkillModel).get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(skill)
    db.commit()
    return {"ok": True}