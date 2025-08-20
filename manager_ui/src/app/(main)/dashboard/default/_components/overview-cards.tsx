"use client";

import {
  Briefcase,
  CalendarClock,
  CheckCircle,
  Users,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ProjectHealth,
  ResourceManagement,
  TaskPerformance,
} from "../utils/types";

interface OverviewCardsProps {
  projectHealth: ProjectHealth;
  resourceManagement: ResourceManagement;
  taskPerformance: TaskPerformance;
}

export function OverviewCards({
  projectHealth,
  resourceManagement,
  taskPerformance,
}: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Projects",
      value: projectHealth.total_projects,
      icon: <Briefcase className="size-5 text-muted-foreground" />,
    },
    {
      title: "Projects In Progress",
      value: projectHealth.projects_in_progress,
      icon: <CalendarClock className="size-5 text-muted-foreground" />,
    },
    {
      title: "Completed Projects",
      value: projectHealth.completed_projects,
      icon: <CheckCircle className="size-5 text-green-500" />,
    },
    {
      title: "Total Employees",
      value: resourceManagement.total_employees,
      icon: <Users className="size-5 text-muted-foreground" />,
    },
    {
      title: "Employees On Leave",
      value: resourceManagement.employees_on_leave_today,
      icon: <UserX className="size-5 text-yellow-500" />,
    },
    {
      title: "Overdue Tasks",
      value: taskPerformance.total_overdue_tasks,
      icon: <AlertTriangle className="size-5 text-red-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
