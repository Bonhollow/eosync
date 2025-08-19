"use client";

import { Pie, PieChart, Bar, BarChart, CartesianGrid, LabelList, YAxis, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartConfig } from "@/components/ui/chart";
import { ProjectHealth, TaskPerformance } from "../utils/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

interface InsightCardsProps {
  projectHealth: ProjectHealth;
  taskPerformance: TaskPerformance;
}

export function InsightCards({ projectHealth, taskPerformance }: InsightCardsProps) {
  const taskStatusData = taskPerformance.task_status_breakdown.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
  }));

  const taskStatusChartConfig = taskStatusData.reduce((acc, cur) => {
    acc[cur.status] = { label: cur.status.replace("_", " "), color: cur.fill };
    return acc;
  }, {} as ChartConfig);

  const projectProgressData = projectHealth.projects_summary.map(p => ({
    name: p.title,
    progress: p.progress_percentage
  }));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Tasks by Status</CardTitle>
        </CardHeader>
        <CardContent className="max-h-48">
          <ChartContainer config={taskStatusChartConfig} className="size-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
              <Pie data={taskStatusData} dataKey="count" nameKey="status" innerRadius={50} outerRadius={70} />
              <ChartLegend
                content={<ChartTooltipContent nameKey="status" hideLabel />}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 xl:col-span-3">
        <CardHeader>
          <CardTitle>Project Progress (%)</CardTitle>
        </CardHeader>
        <CardContent className="size-full max-h-52">
          <ChartContainer config={{ progress: { label: "Progress", color: "hsl(var(--chart-1))" } }} className="size-full">
            <BarChart data={projectProgressData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={100}
                tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
              />
              <XAxis dataKey="progress" type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="progress" layout="vertical" fill="var(--color-progress)" radius={4}>
                <LabelList
                  dataKey="progress"
                  position="right"
                  offset={8}
                  className="fill-foreground text-xs"
                  formatter={(value: number) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}