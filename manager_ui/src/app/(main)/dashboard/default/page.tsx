import { OperationalCards } from "./_components/operational-cards";
import { OverviewCards } from "./_components/overview-cards";
import { EmployeeAssignmentsCard } from "./_components/employee-assignments-card";
import { getAnalytics, getEmployeeSchedule } from "./utils/api";

export default async function Page() {
  const [analyticsData, scheduleData] = await Promise.all([
    getAnalytics(),
    getEmployeeSchedule() 
  ]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <OverviewCards
        projectHealth={analyticsData.project_health}
        resourceManagement={analyticsData.resource_management}
        taskPerformance={analyticsData.task_performance}
      />    
      <EmployeeAssignmentsCard
        initialScheduleData={scheduleData}
      />
      <OperationalCards
        projectData={analyticsData.project_health}
        taskData={analyticsData.task_performance}
        taskPerformance={analyticsData.task_performance}
      />
    </div>
  );
}