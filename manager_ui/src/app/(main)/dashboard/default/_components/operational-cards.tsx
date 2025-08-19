"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TaskPerformance, ProjectHealth } from "../utils/types";

interface OperationalCardsProps {
    taskData: TaskPerformance;
    projectData: ProjectHealth;
}

export function OperationalCards({ taskData, projectData }: OperationalCardsProps) {
  const projectsWithProgress = projectData.projects_summary.filter(p => p.progress_percentage > 0);

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription className="font-medium">
            Completion status of active projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {projectsWithProgress.map((project) => (
              <div key={project.id} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{project.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress_percentage} />
                  <span className="text-muted-foreground text-xs font-medium tabular-nums">{project.progress_percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-muted-foreground flex justify-between gap-1 text-xs">
            <span>{projectsWithProgress.length} projects started</span>
          </div>
        </CardFooter>
      </Card>

      <Card className="sm:col-span-2">
        <CardHeader>
          <CardTitle>Overdue Tasks</CardTitle>
          <CardDescription>
            {taskData.total_overdue_tasks} tasks require immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {taskData.overdue_tasks_list.slice(0, 5).map((item) => ( // Show top 5
              <li key={item.id} className="space-y-1 rounded-md border px-3 py-2">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive size-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-destructive bg-destructive/20 w-fit rounded-md px-2 py-1 text-xs font-medium">
                        High Priority
                    </span>
                </div>
                <div className="text-muted-foreground pl-6 text-xs font-medium">Project: {item.project_title}</div>
                <div className="flex items-center gap-1.5 pl-6">
                  <Clock className="text-muted-foreground size-3" />
                  <span className="text-muted-foreground text-xs font-medium">{item.days_overdue} days overdue</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}