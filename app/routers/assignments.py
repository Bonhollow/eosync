from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.assignment import Assignment as AssignmentModel
from schemas.assignment import AssignmentCreate, Assignment as AssignmentSchema

router = APIRouter()

@router.post("/", response_model=AssignmentSchema)
def assign_task(a: AssignmentCreate, db: Session = Depends(get_db)):
    db_asg = AssignmentModel(**a.model_dump())
    db.add(db_asg)
    db.commit()
    db.refresh(db_asg)
    return db_asg

@router.get("/", response_model=List[AssignmentSchema])
def read_assignments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(AssignmentModel).offset(skip).limit(limit).all()

@router.delete("/")
def remove_assignment(employee_id: int, task_id: int, db: Session = Depends(get_db)):
    asg = db.query(AssignmentModel).get((employee_id, task_id))
    if not asg:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(asg)
    db.commit()
    return {"ok": True}