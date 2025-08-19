from fastapi import APIRouter, UploadFile, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pathlib import Path
from tempfile import NamedTemporaryFile
from docling.document_converter import DocumentConverter
from agents.skill_agent import agent as skill_agent
from agents.employee_agent import agent as employee_agent
from agents.project_agent import agent as project_agent
from agents.employee_assign_agent import agent as assignment_agent
from models.assignment import Assignment as AssignmentModel
from core.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.skill import Skill as SkillModel
from schemas.skill import Skill as SkillSchema
from schemas.employee import EmployeeBase as EmployeeSchema
from models.employee import Employee as EmployeeModel
from models.project import Project as ProjectModel
from models.task import Task as TaskModel
from schemas.project import Project as ProjectSchema
from schemas.project import ProjectCreate as ProjectCreateSchema
from schemas.task import TaskCreate as TaskCreateSchema
from pydantic import BaseModel, ValidationError
from typing import List, Any
import json
import os
from sqlalchemy.orm import joinedload
from datetime import date

router = APIRouter()

class Origin(BaseModel):
    mimetype: str
    filename: str

class DocumentPayload(BaseModel):
    schema_name: str
    version: str
    name: str
    origin: Origin
    tables: List[Any]

class SkillsInput(BaseModel):
    text: str

class EmployeesInput(BaseModel):
    text: str

class ProjectInput(BaseModel):
    text: str

@router.post("/file/elaborate_skills", response_model=List[SkillSchema])
async def elaborate_skills(
    file: UploadFile,
    db: Session = Depends(get_db),
):
    with NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
        temp_path = Path(tmp.name)
        tmp.write(await file.read())
    try:
        converter = DocumentConverter()
        doc = converter.convert(temp_path)
        try:
            _ = DocumentPayload(**doc.document.export_to_dict())
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=e.errors())
        text = (doc.document.export_to_text() or "").strip()
        if not text:
            text = (doc.document.export_to_markdown() or "").strip()
        if not text:
            text = json.dumps(doc.document.export_to_dict(), ensure_ascii=False)
        if not text.strip():
            raise HTTPException(status_code=422, detail="No extractable text found in the uploaded file.")
        run_response = await skill_agent.arun(message=SkillsInput(text=text))
        content = getattr(run_response, "content", None)
        if content and hasattr(content, "skills"):
            extracted = content.skills
        else:
            if isinstance(content, dict) and "skills" in content:
                extracted = content["skills"]
            elif hasattr(run_response, "skills"):
                extracted = run_response.skills
            else:
                extracted = []
        skill_names = list(dict.fromkeys(s.strip() for s in (extracted or []) if s and s.strip()))
        if not skill_names:
            return []
        existing = db.query(SkillModel).filter(SkillModel.name.in_(skill_names)).all()
        existing_names = {s.name for s in existing}
        new_names = [n for n in skill_names if n not in existing_names]
        if not new_names:
            return existing
        try:
            new_models = [SkillModel(name=n) for n in new_names]
            db.add_all(new_models)
            db.commit()
            for m in new_models:
                db.refresh(m)
        except IntegrityError:
            db.rollback()
            refetched = db.query(SkillModel).filter(SkillModel.name.in_(new_names)).all()
            if refetched:
                return existing + refetched
            raise HTTPException(status_code=500, detail="Database integrity error")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Unexpected DB error: {e}")
        return existing + new_models
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass

@router.post("/file/elaborate_employees", response_model=List[EmployeeSchema])
async def elaborate_employees(
    file: UploadFile,
    db: Session = Depends(get_db),
):
    with NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
        temp_path = Path(tmp.name)
        tmp.write(await file.read())
    try:
        converter = DocumentConverter()
        doc = converter.convert(temp_path)
        try:
            _ = DocumentPayload(**doc.document.export_to_dict())
        except ValidationError:
            pass
        text = (doc.document.export_to_text() or "").strip()
        if not text:
            text = (doc.document.export_to_markdown() or "").strip()
        if not text:
            text = json.dumps(doc.document.export_to_dict(), ensure_ascii=False)
        if not text.strip():
            raise HTTPException(status_code=422, detail="No extractable text found in the uploaded file.")

        run_response = await employee_agent.arun(message=EmployeesInput(text=text))
        content = getattr(run_response, "content", None)
        if content and hasattr(content, "employees"):
            extracted = content.employees
        else:
            if isinstance(content, dict) and "employees" in content:
                extracted = content["employees"]
            elif hasattr(run_response, "employees"):
                extracted = run_response.employees
            else:
                extracted = []

        if not isinstance(extracted, list):
            raise HTTPException(status_code=422, detail="Agent did not return a list of employees.")

        try:
            validated_employees = [EmployeeSchema.model_validate(emp, from_attributes=True) for emp in extracted]
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=jsonable_encoder(e.errors()))

        if not validated_employees:
            return []

        employee_emails = {emp.email for emp in validated_employees if emp.email}
        if not employee_emails:
            raise HTTPException(status_code=422, detail="No employees with email could be extracted.")

        existing = db.query(EmployeeModel).filter(EmployeeModel.email.in_(employee_emails)).all()
        existing_emails = {e.email for e in existing}

        new_employee_schemas = [emp for emp in validated_employees if emp.email and emp.email not in existing_emails]

        if not new_employee_schemas:
            return existing

        try:
            new_models = [EmployeeModel(**emp.model_dump()) for emp in new_employee_schemas]
            db.add_all(new_models)
            db.commit()
            for m in new_models:
                db.refresh(m)
        except IntegrityError:
            db.rollback()
            refetched_emails = {emp.email for emp in new_employee_schemas}
            refetched = db.query(EmployeeModel).filter(EmployeeModel.email.in_(refetched_emails)).all()
            if refetched:
                return existing + refetched
            raise HTTPException(status_code=500, detail="Database integrity error")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Unexpected DB error: {e}")

        return existing + new_models
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass

@router.post("/generate/elaborate_projects", response_model=ProjectSchema)
async def elaborate_projects(query: str, db: Session = Depends(get_db)):
    run_response = await project_agent.arun(message=query)

    try:
        project_dict = run_response.content.dict()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"AI response validation failed: {e}")

    if not project_dict:
        raise HTTPException(status_code=500, detail="The AI failed to generate a valid project structure. Please try again.")

    print(f"Generated project data: {project_dict}")
    try:
        validated_project_data = ProjectCreateSchema.model_validate(project_dict)
        
        db_project = ProjectModel(**validated_project_data.model_dump())
        
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
    except (ValidationError, Exception) as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error while creating project: {e}")

    try:
        tasks_to_add = []
        for task_data in project_dict.get('tasks', []):
            validated_task = TaskCreateSchema.model_validate(task_data)

            db_task = TaskModel(
                **validated_task.model_dump(),
                project_id=db_project.id  
            )
            tasks_to_add.append(db_task)

        if tasks_to_add:
            db.add_all(tasks_to_add)
            db.commit()
    except (ValidationError, Exception) as e:
        db.rollback()
        db.delete(db_project)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Database error while creating tasks: {e}")

    db_project = (
        db.query(ProjectModel)
        .options(joinedload(ProjectModel.tasks))
        .filter(ProjectModel.id == db_project.id)
        .first()
    )

    if not db_project:
        raise HTTPException(status_code=500, detail="Project not found after creation")

    return db_project

@router.post("/generate/generate-assignments/{project_id}/", response_model=ProjectSchema)
async def assign_employees_to_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Progetto non trovato")

    tasks = db.query(TaskModel).filter(TaskModel.project_id == project_id).all()
    employees = db.query(EmployeeModel).all()

    if not tasks or not employees:
        raise HTTPException(status_code=400, detail="Progetto senza task o dipendenti disponibili")

    project_context = {
        "project": {"id": project.id, "title": project.title, "description": project.description},
        "tasks": [{"id": t.id, "title": t.title, "description": t.description} for t in tasks],
        "employees": [{"id": e.id, "last_name": e.last_name, "email": e.email, "skills": e.skills} for e in employees],
    }

    context = json.dumps(project_context, indent=2)

    result = assignment_agent.run(context)

    assignment_list = result.content

    for assignment in assignment_list.assignments:
        new_assignment = AssignmentModel(
            employee_id=assignment.employee_id,
            task_id=assignment.task_id,
            role_on_task=assignment.role_on_task,
            assigned_hours=assignment.assigned_hours,
        )
        print(f"Adding assignment: {new_assignment}")
        db.add(new_assignment)

    db.commit()
    db.refresh(project)

    return project