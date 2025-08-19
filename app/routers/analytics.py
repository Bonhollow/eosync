from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import date
from core.database import get_db

from models.project import Project as ProjectModel
from models.task import Task as TaskModel, TaskStatus
from models.employee import Employee as EmployeeModel
from models.assignment import Assignment as AssignmentModel
from models.leave import Leave as LeaveModel
from schemas.analytics import (
    ProjectSummarySchema, ProjectHealthAnalytics, ResourceManagementAnalytics,
    EmployeeWorkload, DepartmentAllocation, TaskStatusDistribution, OverdueTask,
    TaskPerformanceAnalytics, EmployeeAssignmentDetails, ProjectAssignmentInfo,
    EmployeeAssignmentsAnalytics, DashboardAnalytics
)

router = APIRouter()

@router.get("/dashboard", response_model=DashboardAnalytics)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    today = date.today()

    all_projects = db.query(ProjectModel).options(
        joinedload(ProjectModel.tasks)
        .joinedload(TaskModel.assignments)
        .joinedload(AssignmentModel.employee)
    ).all()

    projects_summary = []
    completed_projects = 0
    overdue_projects = 0
    projects_in_progress = 0

    for project in all_projects:
        total_tasks = len(project.tasks)
        if total_tasks > 0:
            completed_tasks_count = sum(1 for task in project.tasks if task.status == TaskStatus.DONE)
            progress_percentage = (completed_tasks_count / total_tasks) * 100
        else:
            completed_tasks_count = 0
            progress_percentage = 0.0
        is_completed = total_tasks > 0 and completed_tasks_count == total_tasks
        is_overdue = project.end_date and project.end_date < today and not is_completed
        actual_cost = 0.0
        for task in project.tasks:
            for assignment in task.assignments:
                if assignment.employee and assignment.employee.salary and assignment.assigned_hours:
                    hourly_rate = assignment.employee.salary / 2080
                    actual_cost += assignment.assigned_hours * hourly_rate
        health_status = "On Track"
        if is_completed:
            health_status = "Completed"
            completed_projects += 1
        elif is_overdue:
            health_status = "Overdue"
            overdue_projects += 1
        elif project.budget_total and actual_cost > project.budget_total:
            health_status = "Over Budget"
        if project.start_date <= today and not is_completed and not is_overdue:
            projects_in_progress += 1
        projects_summary.append(ProjectSummarySchema(
            id=project.id, title=project.title, start_date=project.start_date, end_date=project.end_date,
            progress_percentage=round(progress_percentage, 2), budget_total=project.budget_total,
            actual_cost=round(actual_cost, 2) if actual_cost > 0 else None, health_status=health_status
        ))

    project_health_data = ProjectHealthAnalytics(
        total_projects=len(all_projects), projects_in_progress=projects_in_progress,
        completed_projects=completed_projects, overdue_projects=overdue_projects, projects_summary=projects_summary
    )

    total_employees = db.query(EmployeeModel).count()
    employees_on_leave_today = db.query(LeaveModel).filter(
        LeaveModel.approved == True, LeaveModel.start_date <= today, LeaveModel.end_date >= today
    ).count()
    workload_query = db.query(
        EmployeeModel.id, EmployeeModel.first_name, EmployeeModel.last_name,
        func.sum(AssignmentModel.assigned_hours).label('total_hours')
    ).outerjoin(AssignmentModel, EmployeeModel.id == AssignmentModel.employee_id).group_by(EmployeeModel.id).all()
    employee_workloads = []
    over_allocated_employees = 0
    for emp_id, first, last, total_hours in workload_query:
        assigned_hours = total_hours or 0.0
        employee_workloads.append(EmployeeWorkload(
            employee_id=emp_id, full_name=f"{first or ''} {last}".strip(), total_assigned_hours=assigned_hours
        ))
        if assigned_hours > 40:
            over_allocated_employees += 1
    dept_dist_query = db.query(
        EmployeeModel.department, func.count(EmployeeModel.id).label('count')
    ).group_by(EmployeeModel.department).all()
    department_distribution = [
        DepartmentAllocation(department=dept or "Unassigned", employee_count=count) for dept, count in dept_dist_query
    ]
    resource_management_data = ResourceManagementAnalytics(
        total_employees=total_employees, employees_on_leave_today=employees_on_leave_today,
        over_allocated_employees=over_allocated_employees, department_distribution=department_distribution,
        employee_workloads=employee_workloads
    )

    total_open_tasks = db.query(TaskModel).filter(TaskModel.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])).count()
    overdue_tasks_query = db.query(TaskModel).join(ProjectModel).filter(
        TaskModel.end_date < today, TaskModel.status != TaskStatus.DONE
    ).options(joinedload(TaskModel.project)).all()
    overdue_tasks_list = [
        OverdueTask(
            id=task.id, title=task.title, project_title=task.project.title, end_date=task.end_date,
            days_overdue=(today - task.end_date).days if task.end_date else 0
        ) for task in overdue_tasks_query
    ]
    status_breakdown_query = db.query(TaskModel.status, func.count(TaskModel.id).label('count')).group_by(TaskModel.status).all()
    task_status_breakdown = [TaskStatusDistribution(status=status.value, count=count) for status, count in status_breakdown_query]
    task_performance_data = TaskPerformanceAnalytics(
        total_open_tasks=total_open_tasks, total_overdue_tasks=len(overdue_tasks_list),
        task_status_breakdown=task_status_breakdown, overdue_tasks_list=overdue_tasks_list
    )
    
    assignment_details_query = db.query(
        ProjectModel.id.label("project_id"),
        ProjectModel.title.label("project_title"),
        EmployeeModel.id.label("employee_id"),
        EmployeeModel.first_name,
        EmployeeModel.last_name,
        func.sum(AssignmentModel.assigned_hours).label("total_hours")
    ).select_from(ProjectModel)\
    .join(TaskModel, ProjectModel.id == TaskModel.project_id)\
    .join(AssignmentModel, TaskModel.id == AssignmentModel.task_id)\
    .join(EmployeeModel, AssignmentModel.employee_id == EmployeeModel.id)\
    .group_by(
        ProjectModel.id,
        ProjectModel.title,
        EmployeeModel.id,
        EmployeeModel.first_name,
        EmployeeModel.last_name
    ).order_by(ProjectModel.id, EmployeeModel.id).all()

    assignments_by_project_map = {}
    for row in assignment_details_query:
        if row.project_id not in assignments_by_project_map:
            assignments_by_project_map[row.project_id] = ProjectAssignmentInfo(
                project_id=row.project_id,
                project_title=row.project_title,
                assigned_employees=[]
            )
        
        assignments_by_project_map[row.project_id].assigned_employees.append(
            EmployeeAssignmentDetails(
                employee_id=row.employee_id,
                full_name=f"{row.first_name or ''} {row.last_name}".strip(),
                assigned_hours_in_project=row.total_hours or 0.0
            )
        )
    
    employee_assignments_data = EmployeeAssignmentsAnalytics(
        assignments_by_project=list(assignments_by_project_map.values())
    )
    
    return DashboardAnalytics(
        project_health=project_health_data,
        resource_management=resource_management_data,
        task_performance=task_performance_data,
        employee_assignments=employee_assignments_data
    )