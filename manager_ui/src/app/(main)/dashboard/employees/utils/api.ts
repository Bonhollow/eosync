import axios from "axios";

export async function getEmployees() {
    const response = await axios.get("http://localhost:8000/employees");
    return response.data;
}

export async function getSkills() {
    const response = await axios.get("http://localhost:8000/skills");
    return response.data;
}

export async function createEmployee(
    emp: object | object[]
) {
    const response = await axios.post("http://localhost:8000/employees", emp);
    return response.data;
}

export async function editEmployee(
    id: number,
    emp: object | object[]
) {
    const response = await axios.put(`http://localhost:8000/employees/${id}`, emp);
    return response.data;
}

export async function createEmployeesFromFile(file: File) {
    const formData = new FormData();

    formData.append("file", file);
    const response = await axios.post("http://localhost:8000/upload/file/elaborate_employees", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    
    return response.data;
}

export async function deleteEmployee(id: number) {
    const response = await axios.delete(`http://localhost:8000/employees/${id}`);
    return response.data;
}
