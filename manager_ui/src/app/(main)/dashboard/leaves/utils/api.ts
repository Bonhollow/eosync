import axios from "axios";
import {
  Leave,
  LeaveCreate,
  LeaveUpdate,
  Employee,
} from "../_components/schema";

const API_URL = "http://localhost:8000";

export const getLeaves = async (): Promise<Leave[]> => {
  const response = await axios.get(`${API_URL}/leaves/`);
  return response.data;
};

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await axios.get(`${API_URL}/employees/`);
  return response.data;
};

export const createLeave = async (leaveData: LeaveCreate): Promise<Leave> => {
  const response = await axios.post(`${API_URL}/leaves/`, leaveData);
  return response.data;
};

export const updateLeave = async (
  id: number,
  leaveData: Partial<LeaveUpdate>,
): Promise<Leave> => {
  const response = await axios.put(`${API_URL}/leaves/${id}`, leaveData);
  return response.data;
};

export const deleteLeave = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/leaves/${id}`);
};
