from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.project import Project as ProjectModel
from schemas.project import ProjectCreate, Project as ProjectSchema

router = APIRouter()

@router.post("/", response_model=ProjectSchema)
def create_project(proj: ProjectCreate, db: Session = Depends(get_db)):
    db_proj = ProjectModel(**proj.model_dump())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.get("/", response_model=List[ProjectSchema])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ProjectModel).offset(skip).limit(limit).all()

@router.get("/{project_id}", response_model=ProjectSchema)
def read_project(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(ProjectModel).get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(project_id: int, proj_update: ProjectCreate, db: Session = Depends(get_db)):
    proj = db.query(ProjectModel).get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in proj_update.dict(exclude_unset=True).items():
        setattr(proj, key, value)
    db.commit()
    db.refresh(proj)
    return proj

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(ProjectModel).get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"ok": True}