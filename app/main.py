from fastapi import FastAPI
from core.config import settings
from core.database import engine, Base
from routers import employees, skills, projects, tasks, assignments, leaves, upload

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(skills.router, prefix="/skills", tags=["Skills"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
app.include_router(leaves.router, prefix="/leaves", tags=["Leaves"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])

@app.get("/")
def read_root():
    return {"message": "Welcome to {settings.PROJECT_NAME}"}