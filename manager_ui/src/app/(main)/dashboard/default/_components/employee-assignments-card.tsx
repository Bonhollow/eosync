"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeAssignments } from "../utils/types";
import { useMemo } from "react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560", "#775DD0"];

interface EmployeeAssignmentsCardProps {
    employeeAssignments: EmployeeAssignments;
}

export function EmployeeAssignmentsCard({ employeeAssignments }: EmployeeAssignmentsCardProps) {
    const { chartData, employees } = useMemo(() => {
        const uniqueEmployees: { [key: string]: string } = {};
        const dataMap: { [key: string]: any } = {};

        employeeAssignments.assignments_by_project.forEach(project => {
            dataMap[project.project_title] = { name: project.project_title };
            project.assigned_employees.forEach((emp, index) => {
                if (!uniqueEmployees[emp.full_name]) {
                    uniqueEmployees[emp.full_name] = COLORS[Object.keys(uniqueEmployees).length % COLORS.length];
                }
                dataMap[project.project_title][emp.full_name] = emp.assigned_hours_in_project;
            });
        });

        return {
            chartData: Object.values(dataMap),
            employees: Object.keys(uniqueEmployees).map(name => ({ name, color: uniqueEmployees[name] }))
        };
    }, [employeeAssignments]);

    return (
        <Card className="col-span-full">
        <CardHeader>
            <CardTitle>Employee Hours by Project</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {employees.map(employee => (
                <Bar key={employee.name} dataKey={employee.name} stackId="a" fill={employee.color} />
                ))}
            </BarChart>
            </ResponsiveContainer>
        </CardContent>
        </Card>
    );
}