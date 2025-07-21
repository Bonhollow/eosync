from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.employee import Employee as EmployeeModel
from schemas.employee import EmployeeCreate, Employee as EmployeeSchema, EmployeeUpdate

router = APIRouter()

@router.post("/", response_model=EmployeeSchema)
def create_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    db_emp = EmployeeModel(**emp.dict())
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.get("/", response_model=List[EmployeeSchema])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(EmployeeModel).offset(skip).limit(limit).all()

@router.get("/{employee_id}", response_model=EmployeeSchema)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(EmployeeModel).get(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.put("/{employee_id}", response_model=EmployeeSchema)
def update_employee(employee_id: int, emp_update: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(EmployeeModel).get(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in emp_update.model_dump(exclude_unset=True).items():
        setattr(emp, key, value)
    db.commit()
    db.refresh(emp)
    return emp

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(EmployeeModel).get(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"ok": True}