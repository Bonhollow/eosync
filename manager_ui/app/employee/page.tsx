'use client';

import Sidebar from '../components/sidebar/Sidebar';
import { useEmployees } from '../hooks/useEmployees';
import { useState } from 'react';
import { Modal, Button } from 'antd';
import CreateEmployee from '../components/modals/create-employee/CreateEmployee';

export default function EmployeePage() {
    const { employees, isLoading, isError, addEmployee, deleteEmployee } = useEmployees();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="flex min-h-screen bg-black text-white">
        <Sidebar>
            <h1 className="text-2xl font-bold mb-4">Employees</h1>
            <Button type="primary" onClick={showModal}>
                Open Modal
            </Button>
            <Modal
                title="Basic Modal"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
            >
                <CreateEmployee />
            </Modal>
            {isLoading && <p>Loading...</p>}
            {isError && <p>Error loading employees</p>}
            {employees && (
            <ul className="space-y-2">
                {employees.map((emp: any) => (
                <li key={emp.id} className="flex justify-between items-center">
                    <span>{emp.first_name} {emp.last_name} – {emp.role}</span>
                    <button onClick={() => deleteEmployee(emp.id)} className="bg-red-600 px-2 py-1">Delete</button>
                </li>
                ))}
            </ul>
            )}
        </Sidebar>
        </div>
    );
}
