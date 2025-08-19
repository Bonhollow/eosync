"use client";

import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyScheduleResponse, EmployeeSchedule } from "../utils/types";
import { getEmployeeScheduleClient } from "../utils/api";

interface EmployeeAssignmentsCardProps {
    initialScheduleData: WeeklyScheduleResponse;
}

const projectColors = [
    "bg-red-100 text-red-800 border-red-200",
    "bg-green-100 text-green-800 border-green-200",
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-yellow-100 text-yellow-800 border-yellow-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
];
const getProjectColor = (projectId: number) => {
    return projectColors[projectId % projectColors.length];
};
const getWeekDates = (startDate: string): Date[] => {
    const dates = [];
    const start = new Date(startDate + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
        dates.push(addDays(start, i));
    }
    return dates;
};

export function EmployeeAssignmentsCard({ initialScheduleData }: EmployeeAssignmentsCardProps) {
    const [scheduleData, setScheduleData] = useState(initialScheduleData);
    const [isLoading, setIsLoading] = useState(false);
    const weekDates = getWeekDates(scheduleData.start_of_week);
    const currentMonthYear = format(new Date(scheduleData.start_of_week), "MMMM yyyy");

    const navigateWeek = async (direction: 'prev' | 'next') => {
        setIsLoading(true);
        const currentDate = new Date(scheduleData.start_of_week);
        const newDate = direction === 'next' ? addDays(currentDate, 7) : subDays(currentDate, 7);
        try {
            const newScheduleData = await getEmployeeScheduleClient(newDate);
            setScheduleData(newScheduleData); 
        } catch (error) {
            console.error("Failed to fetch new week schedule:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={isLoading ? "opacity-50 transition-opacity" : ""}>
            <CardHeader>
                <CardTitle>Employee Assignments</CardTitle>
                <CardDescription>View resource allocation by project or by weekly schedule.</CardDescription>
            </CardHeader>
            <CardContent>  
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{currentMonthYear}</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')} disabled={isLoading}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateWeek('next')} disabled={isLoading}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                    <div className="grid" style={{ gridTemplateColumns: "180px repeat(7, minmax(140px, 1fr))" }}>
                        <div className="sticky left-0 bg-muted font-semibold text-sm p-2 border-b border-r">Employee</div>
                        {weekDates.map(date => (
                            <div key={date.toISOString()} className="font-semibold text-sm p-2 text-center border-b">
                                {format(date, "eee dd")}
                            </div>
                        ))}
                        {scheduleData.employees.map((employee: EmployeeSchedule) => (
                            <div key={employee.employee_id} className="contents">
                                <div className="sticky left-0 bg-background text-sm p-2 border-b border-r">
                                    <p className="font-semibold">{employee.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                                </div>
                                {weekDates.map(date => {
                                    const dateStr = format(date, "yyyy-MM-dd");
                                    const tasksForDay = employee.schedule[dateStr] || [];
                                    return (
                                        <div key={dateStr} className="p-1 border-b space-y-1 min-h-[60px]">
                                            {tasksForDay.map(task => (
                                                <div key={task.task_id} title={`${task.task_title} (${task.project_title})`}
                                                    className={`text-xs p-1.5 rounded-md border truncate ${getProjectColor(task.project_id)}`}>
                                                    {task.task_title}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    {scheduleData.employees.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No employees scheduled for this week.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}