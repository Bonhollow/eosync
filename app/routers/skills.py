from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.skill import Skill as SkillModel
from schemas.skill import SkillUpdate, Skill as SkillSchema

router = APIRouter()


@router.post("/", response_model=list[SkillSchema])
def create_skills(skills: List[str], db: Session = Depends(get_db)):
    skill_names = list(dict.fromkeys([s.strip() for s in skills if s.strip()]))

    db_skills = [SkillModel(name=skill_name) for skill_name in skill_names]
    db.add_all(db_skills)
    db.commit()
    for db_skill in db_skills:
        db.refresh(db_skill)
    return db_skills

@router.get("/", response_model=List[SkillSchema])
def read_skills(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(SkillModel).offset(skip).limit(limit).all()

@router.put("/{skill_id}", response_model=SkillSchema)
def update_skill(skill_id: int, skill: SkillUpdate, db: Session = Depends(get_db)):
    """
    Update a skill's details.
    """
    db_skill = db.query(SkillModel).get(skill_id)
    
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
        
    # Update the skill's name
    db_skill.name = skill.name
    
    db.commit()
    db.refresh(db_skill)
    
    return db_skill

@router.delete("/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(SkillModel).get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(skill)
    db.commit()
    return {"ok": True}