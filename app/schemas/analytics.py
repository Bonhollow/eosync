from typing import List, Optional, Dict
from datetime import date
from pydantic import BaseModel


class ProjectSummarySchema(BaseModel):
    id: int
    title: str
    start_date: date
    end_date: Optional[date]
    progress_percentage: float
    budget_total: Optional[float] = None
    actual_cost: Optional[float] = None
    health_status: str 

class ProjectHealthAnalytics(BaseModel):
    total_projects: int
    projects_in_progress: int
    completed_projects: int
    overdue_projects: int
    projects_summary: List[ProjectSummarySchema]

class EmployeeWorkload(BaseModel):
    employee_id: int
    full_name: str
    total_assigned_hours: float

class DepartmentAllocation(BaseModel):
    department: str
    employee_count: int

class ResourceManagementAnalytics(BaseModel):
    total_employees: int
    employees_on_leave_today: int
    over_allocated_employees: int
    department_distribution: List[DepartmentAllocation]
    employee_workloads: List[EmployeeWorkload]

class TaskStatusDistribution(BaseModel):
    status: str
    count: int

class OverdueTask(BaseModel):
    id: int
    title: str
    project_title: str
    end_date: Optional[date]
    days_overdue: int

class TaskPerformanceAnalytics(BaseModel):
    total_open_tasks: int
    total_overdue_tasks: int
    task_status_breakdown: List[TaskStatusDistribution]
    overdue_tasks_list: List[OverdueTask]

class EmployeeAssignmentDetails(BaseModel):
    employee_id: int
    full_name: str
    assigned_hours_in_project: float

class ProjectAssignmentInfo(BaseModel):
    project_id: int
    project_title: str
    assigned_employees: List[EmployeeAssignmentDetails]

class EmployeeAssignmentsAnalytics(BaseModel):
    assignments_by_project: List[ProjectAssignmentInfo]

class DashboardAnalytics(BaseModel):
    project_health: ProjectHealthAnalytics
    resource_management: ResourceManagementAnalytics
    task_performance: TaskPerformanceAnalytics
    employee_assignments: EmployeeAssignmentsAnalytics
    
class ScheduleTaskInfo(BaseModel):
    task_id: int
    task_title: str
    project_id: int
    project_title: str

class EmployeeScheduleSchema(BaseModel):
    employee_id: int
    full_name: str
    role: Optional[str]
    schedule: Dict[str, List[ScheduleTaskInfo]]

class WeeklyScheduleResponse(BaseModel):
    start_of_week: date
    end_of_week: date
    employees: List[EmployeeScheduleSchema]