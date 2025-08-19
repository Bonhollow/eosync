"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TaskPerformance, ProjectHealth } from "../utils/types";
import { Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartConfig } from "@/components/ui/chart";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

interface OperationalCardsProps {
    taskData: TaskPerformance;
    projectData: ProjectHealth;
    taskPerformance: TaskPerformance;
}

const ChartLegendContent = ({ payload }: any) => {
  if (!payload) return null;
  return (
    <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
      {payload.map((entry: any) => (
        <li key={`item-${entry.value}`} className="flex items-center gap-2 font-medium capitalize leading-none">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value.replace("_", " ")}
        </li>
      ))}
    </ul>
  );
};

export function OperationalCards({ taskData, projectData, taskPerformance }: OperationalCardsProps) {
  const projectsWithProgress = projectData.projects_summary.filter(p => p.progress_percentage > 0);

  const taskStatusData = taskPerformance.task_status_breakdown.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
  }));

  const taskStatusChartConfig = taskStatusData.reduce((acc, cur) => {
    acc[cur.status] = { label: cur.status.replace("_", " "), color: cur.fill };
    return acc;
  }, {} as ChartConfig);

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

      <Card>
        <CardHeader>
          <CardTitle>Overdue Tasks</CardTitle>
          <CardDescription>
            {taskData.total_overdue_tasks} tasks require immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {taskData.overdue_tasks_list.slice(0, 5).map((item) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Tasks by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full min-h-48">
          <ChartContainer config={taskStatusChartConfig} className="mx-auto aspect-square w-full max-w-[250px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
              <Pie data={taskStatusData} dataKey="count" nameKey="status" innerRadius={50} />
              <ChartLegend
                content={<ChartLegendContent />}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}