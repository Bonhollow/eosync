import { InsightCards } from "./_components/insight-cards";
import { OperationalCards } from "./_components/operational-cards";
import { OverviewCards } from "./_components/overview-cards";
import { EmployeeAssignmentsCard } from "./_components/employee-assignments-card";
import { getAnalytics } from "./utils/api";

export default async function Page() {
  const analyticsData = await getAnalytics();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <OverviewCards
        projectHealth={analyticsData.project_health}
        resourceManagement={analyticsData.resource_management}
        taskPerformance={analyticsData.task_performance}
      />
      <InsightCards
        projectHealth={analyticsData.project_health}
        taskPerformance={analyticsData.task_performance}
      />
      <EmployeeAssignmentsCard
        employeeAssignments={analyticsData.employee_assignments}
      />
      <OperationalCards
        projectData={analyticsData.project_health}
        taskData={analyticsData.task_performance}
      />
    </div>
  );
}