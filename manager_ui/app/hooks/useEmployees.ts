// hooks/useEmployees.ts
import useSWR from 'swr';

const API_BASE = 'http://localhost:8000/employees';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useEmployees() {
    const { data, error, isLoading, mutate } = useSWR(API_BASE, fetcher);

    const addEmployee = async (employee: any) => {
        const res = await fetch(API_BASE + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
        });
        if (!res.ok) throw new Error('Failed to add employee');
        mutate();
    };

    const updateEmployee = async (id: number, employee: any) => {
        const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
        });
        if (!res.ok) throw new Error('Failed to update employee');
        mutate(); 
    };

    const deleteEmployee = async (id: number) => {
        const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete employee');
        mutate(); 
    };

    return {
        employees: data,
        isLoading,
        isError: error,
        addEmployee,
        updateEmployee,
        deleteEmployee
    };
}
