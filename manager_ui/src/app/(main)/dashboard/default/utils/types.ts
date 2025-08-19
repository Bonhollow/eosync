export interface ProjectSummary {
    id: number;
    title: string;
    progress_percentage: number;
    health_status: string;
    actual_cost: number | null;
    budget_total: number | null;
}

export interface ProjectHealth {
    total_projects: number;
    projects_in_progress: number;
    completed_projects: number;
    overdue_projects: number;
    projects_summary: ProjectSummary[];
}

export interface EmployeeWorkload {
    employee_id: number;
    full_name: string;
    total_assigned_hours: number;
}

export interface DepartmentAllocation {
    department: string;
    employee_count: number;
}

export interface ResourceManagement {
    total_employees: number;
    employees_on_leave_today: number;
    over_allocated_employees: number;
    department_distribution: DepartmentAllocation[];
    employee_workloads: EmployeeWorkload[];
}

export interface TaskStatusDistribution {
    status: string;
    count: number;
}

export interface OverdueTask {
    id: number;
    title: string;
    project_title: string;
    days_overdue: number;
}

export interface TaskPerformance {
    total_open_tasks: number;
    total_overdue_tasks: number;
    task_status_breakdown: TaskStatusDistribution[];
    overdue_tasks_list: OverdueTask[];
}

export interface EmployeeAssignmentDetails {
    employee_id: number;
    full_name: string;
    assigned_hours_in_project: number;
}

export interface ProjectAssignmentInfo {
    project_id: number;
    project_title: string;
    assigned_employees: EmployeeAssignmentDetails[];
}

export interface EmployeeAssignments {
    assignments_by_project: ProjectAssignmentInfo[];
}

export interface DashboardAnalytics {
    project_health: ProjectHealth;
    resource_management: ResourceManagement;
    task_performance: TaskPerformance;
    employee_assignments: EmployeeAssignments;
}

export interface ScheduleTaskInfo {
    task_id: number;
    task_title: string;
    project_id: number;
    project_title: string;
}

export interface EmployeeSchedule {
    employee_id: number;
    full_name: string;
    role: string | null;
    schedule: Record<string, ScheduleTaskInfo[]>;
}

export interface WeeklyScheduleResponse {
    start_of_week: string; 
    end_of_week: string;   
    employees: EmployeeSchedule[];
}