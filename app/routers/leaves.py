from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from core.database import get_db
from models.leave import Leave as LeaveModel
from models.employee import Employee as EmployeeModel
from schemas.leave import LeaveCreate, LeaveUpdate, Leave as LeaveSchema

router = APIRouter()

@router.post("/", response_model=LeaveSchema)
def request_leave(leave_in: LeaveCreate, db: Session = Depends(get_db)):
    employee = db.query(EmployeeModel).get(leave_in.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db_lv = LeaveModel(**leave_in.model_dump())
    db.add(db_lv)
    db.commit()
    db.refresh(db_lv)
    return db_lv

@router.get("/", response_model=List[LeaveSchema])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    leaves = db.query(LeaveModel).options(joinedload(LeaveModel.employee)).offset(skip).limit(limit).all()
    return leaves

@router.get("/{leave_id}", response_model=LeaveSchema)
def read_leave(leave_id: int, db: Session = Depends(get_db)):
    lv = db.query(LeaveModel).options(joinedload(LeaveModel.employee)).filter(LeaveModel.id == leave_id).first()
    if not lv:
        raise HTTPException(status_code=404, detail="Leave not found")
    return lv

@router.put("/{leave_id}", response_model=LeaveSchema)
def update_leave(leave_id: int, leave_update: LeaveUpdate, db: Session = Depends(get_db)):
    lv = db.query(LeaveModel).get(leave_id)
    if not lv:
        raise HTTPException(status_code=404, detail="Leave not found")

    update_data = leave_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lv, key, value)
        
    db.commit()
    db.refresh(lv)
    # Eager load employee details for the response
    db.refresh(lv, attribute_names=['employee'])
    return lv

@router.delete("/{leave_id}", status_code=204)
def cancel_leave(leave_id: int, db: Session = Depends(get_db)):
    lv = db.query(LeaveModel).get(leave_id)
    if not lv:
        raise HTTPException(status_code=404, detail="Leave not found")
    db.delete(lv)
    db.commit()
    return {"ok": True}