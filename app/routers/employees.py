from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Union
from core.database import get_db
from models.employee import Employee as EmployeeModel
from models.skill import Skill as SkillModel
from schemas.employee import EmployeeCreate, Employee as EmployeeSchema, EmployeeUpdate

router = APIRouter()

@router.post("/", response_model=Union[EmployeeSchema, List[EmployeeSchema]])
def create_employee(
    emp_data: Union[EmployeeCreate, List[EmployeeCreate]] = Body(...),
    db: Session = Depends(get_db)
):
    if isinstance(emp_data, list):
        db_emps = []
        
        all_skill_ids = set()
        for emp_create in emp_data:
            if emp_create.skill_ids:
                all_skill_ids.update(emp_create.skill_ids)

        skills_map = {
            skill.id: skill for skill in db.query(SkillModel).filter(SkillModel.id.in_(all_skill_ids)).all()
        }

        if len(skills_map) != len(all_skill_ids):
            raise HTTPException(status_code=404, detail="One or more skills not found.")

        for emp_create in emp_data:
            employee_dict = emp_create.model_dump(exclude={"skill_ids"})
            db_emp = EmployeeModel(**employee_dict)
            
            if emp_create.skill_ids:
                db_emp.skills = [skills_map[skill_id] for skill_id in emp_create.skill_ids]
            
            db_emps.append(db_emp)

        db.add_all(db_emps)
        db.commit()
        for e in db_emps:
            db.refresh(e) 
        return db_emps

    else:
        employee_dict = emp_data.model_dump(exclude={"skill_ids"})
        skill_ids = emp_data.skill_ids

        db_emp = EmployeeModel(**employee_dict)

        if skill_ids:
            skills = db.query(SkillModel).filter(SkillModel.id.in_(skill_ids)).all()
            if len(skills) != len(skill_ids):
                raise HTTPException(status_code=404, detail="One or more skills not found")
            db_emp.skills = skills

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
    db_employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = emp_update.model_dump(exclude_unset=True)

    if "skill_ids" in update_data:
        skill_ids = update_data.pop("skill_ids")
        
        skills_to_assign = db.query(SkillModel).filter(SkillModel.id.in_(skill_ids)).all()
        
        db_employee.skills = skills_to_assign

    for key, value in update_data.items():
        setattr(db_employee, key, value)

    db.commit()
    db.refresh(db_employee)
    
    return db_employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(EmployeeModel).get(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"ok": True}