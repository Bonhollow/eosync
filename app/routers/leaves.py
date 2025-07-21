from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.leave import Leave as LeaveModel
from schemas.leave import LeaveCreate, Leave as LeaveSchema

router = APIRouter()

@router.post("/", response_model=LeaveSchema)
def request_leave(leave_in: LeaveCreate, db: Session = Depends(get_db)):
    db_lv = LeaveModel(**leave_in.model_dump())
    db.add(db_lv)
    db.commit()
    db.refresh(db_lv)
    return db_lv

@router.get("/", response_model=List[LeaveSchema])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(LeaveModel).offset(skip).limit(limit).all()

@router.put("/{leave_id}", response_model=LeaveSchema)
def update_leave(leave_id: int, leave_update: LeaveCreate, db: Session = Depends(get_db)):
    lv = db.query(LeaveModel).get(leave_id)
    if not lv:
        raise HTTPException(status_code=404, detail="Leave not found")
    for key, value in leave_update.model_dump(exclude_unset=True).items():
        setattr(lv, key, value)
    db.commit()
    db.refresh(lv)
    return lv

@router.delete("/{leave_id}")
def cancel_leave(leave_id: int, db: Session = Depends(get_db)):
    lv = db.query(LeaveModel).get(leave_id)
    if not lv:
        raise HTTPException(status_code=404, detail="Leave not found")
    db.delete(lv)
    db.commit()
    return {"ok": True}
