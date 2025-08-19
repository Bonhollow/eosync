import {
  LayoutDashboard,
  ChartBar,
  Users,
  SquareKanban,
  Wrench,
  DoorOpen,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Home",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "Employees",
        url: "/dashboard/employees",
        icon: Users,
      },
      {
        title: "Leaves",
        url: "/dashboard/leaves",
        icon: DoorOpen,
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
        icon: SquareKanban,
      },
      {
        title: "Skills",
        url: "/dashboard/skills",
        icon: Wrench,
      },
      {
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
      }
    ],
  }
];
