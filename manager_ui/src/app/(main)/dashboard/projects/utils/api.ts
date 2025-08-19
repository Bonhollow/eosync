import axios from 'axios';
import {
    Project,
    NewProjectPayload,
    Task,
    NewTaskPayload,
    Assignment,
    NewAssignmentPayload
} from "../_components/schema";

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    }
});

export async function getProjects(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>('/projects/');
    return response.data;
}

export async function createProject(projectData: NewProjectPayload): Promise<Project> {
    const response = await apiClient.post<Project>('/projects/', projectData);
    return response.data;
}

export async function generateProject(query: string): Promise<Project> {
    const response = await apiClient.post<Project>('/upload/generate/elaborate_projects', null, {
        params: { query }
    });
    return response.data;
}


export async function editProject(projectId: number, projectData: Partial<NewProjectPayload>): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${projectId}/`, projectData);
    return response.data;
}

export async function deleteProject(projectId: number): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/`);
}

export async function createTask(taskData: NewTaskPayload): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks/', taskData);
    return response.data;
}

export async function updateTask(taskId: number, taskData: Partial<NewTaskPayload>): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}/`, taskData);
    return response.data;
}

export async function deleteTask(taskId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/`);
}

export async function getAssignments(): Promise<Assignment[]> {
    const response = await apiClient.get<Assignment[]>('/assignments/');
    return response.data;
}

export async function createAssignment(assignmentData: NewAssignmentPayload): Promise<Assignment> {
    const response = await apiClient.post<Assignment>('/assignments/', assignmentData);
    return response.data;
}

export async function deleteAssignment(employeeId: number, taskId: number): Promise<void> {
    await apiClient.delete('/assignments/', {
        params: {
            employee_id: employeeId,
            task_id: taskId
        }
    });
}

export async function getEmployees() {
    const response = await apiClient.get('/employees/');
    return response.data;
}