import { ColumnDef } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Employee } from "./schema";
import { deleteEmployee, editEmployee } from "../utils/api";
import { Wrench } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Select from 'react-select';
import { customStyles } from "../utils/customStyles";

interface EmployeeUpdatePayload {
  first_name?: string | null;
  last_name?: string;
  birth_date?: string | null;
  email?: string | null;
  phone?: string | null;
  hire_date?: string | null;
  role?: string;
  department?: string | null;
  salary?: number | null;
  skill_ids?: number[];
}

type SkillOption = {
  value: number; 
  label: string;
};

export const getEmployeesColumns = (skillOptions: SkillOption[]): ColumnDef<Employee>[] => [
  {
    accessorKey: "first_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
    cell: ({ row }) => <span>{row.original.first_name ?? "-"}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
    cell: ({ row }) => <span>{row.original.last_name ?? "-"}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "birth_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Birth Date" />,
    cell: ({ row }) => <span>{row.original.birth_date ?? "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <span>{row.original.email ?? "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => <span>{row.original.phone ?? "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "hire_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hire Date" />,
    cell: ({ row }) => <span>{row.original.hire_date ?? "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => <span>{row.original.role ?? "-"}</span>,
    enableSorting: false,
  },
  {
      id: "skills",
      header: "Skills",
      cell: ({ row }) => {
        const employee = row.original;
        const skills = employee.skills || [];
        const [isModalOpen, setIsModalOpen] = useState(false);

        return (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Wrench className="size-4" />
                <Badge variant="secondary" className="px-2">{skills.length}</Badge>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Skills for: {employee.last_name}</DialogTitle>
                <DialogDescription>
                  These are the skills associated with this employee.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-4">
                {skills.map(skill => (
                  <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div>
                      <p className="font-semibold">{skill.name}</p>
                    </div>
                  </div>
                ))}

                {skills.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No skills found for this employee.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      },
      enableSorting: false,
  },
  {
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: ({ row }) => <span>{row.original.department ?? "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "salary",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Salary" />,
    cell: ({ row }) => (
      <span>
        {row.original.salary != null ? row.original.salary.toFixed(2) : "-"}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row, table }) => { // <-- Destructure 'table' to access meta
      const employee: Employee = row.original;
      const [openEdit, setOpenEdit] = useState(false);
      
      // ** CHANGED **: Initialize form state by mapping skills to skill_ids
      const [formData, setFormData] = useState({
        ...employee,
        skill_ids: employee.skills ? employee.skills.map(skill => skill.id) : [],
      });

      const onSave = async () => {
        // ** CHANGED **: Create the payload by excluding non-updatable fields
        const { id, skills, ...payload } = formData;
        
        await editEmployee(employee.id, payload as EmployeeUpdatePayload);
        setOpenEdit(false);

        // To see changes, you need to refresh the table's data.
        // The recommended way is to use a function passed via table.meta.
        // Example: (table.meta as any)?.refreshData?.();
        // A simpler but less ideal way: window.location.reload();
      };

      return (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => {
                // Re-initialize form data every time the dialog opens to ensure it's fresh
                setFormData({
                    ...employee,
                    skill_ids: employee.skills ? employee.skills.map(skill => skill.id) : [],
                });
                setOpenEdit(true);
              }}
            >
              <Pen className="size-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => deleteEmployee(employee.id)}
            >
              <Trash className="size-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>

          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
              </DialogHeader>

              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSave();
                }}
              >
                {/* --- Input fields (no changes here) --- */}
                <div>
                  <label htmlFor="first_name" className="block text-xs font-medium mb-1">
                    First Name
                  </label>
                  <Input
                    id="first_name"
                    value={formData.first_name ?? ""}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-xs font-bold mb-1">
                    Last Name *
                  </label>
                  <Input
                    id="last_name"
                    value={formData.last_name ?? ""}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="birth_date">
                    Birth Date
                  </label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date ?? ""}
                    onChange={(e) => setFormData(formData => ({ ...formData, birth_date: e.target.value }))}
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email ?? ""}
                    onChange={(e) => setFormData(formData => ({ ...formData, email: e.target.value }))}
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="phone">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    placeholder="Phone number"
                    value={formData.phone ?? ""}
                    onChange={(e) => setFormData(formData => ({ ...formData, phone: e.target.value }))}
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="hire_date">
                    Hire Date
                  </label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date ?? ""}
                    onChange={(e) => setFormData(formData => ({ ...formData, hire_date: e.target.value }))}
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1" htmlFor="role">
                    Role *
                  </label>
                  <Input
                    id="role"
                    placeholder="Job role"
                    value={formData.role ?? ""}
                    onChange={(e) => setFormData(formData => ({ ...formData, role: e.target.value }))}
                    required
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="department">
                    Department
                  </label>
                  <Input
                    id="department"
                    placeholder="Department"
                    value={formData.department ?? ""}
                    onChange={(e) => setFormData(formData => ({ ...formData, department: e.target.value }))}
                    className="text-sm h-8"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="salary">
                    Salary
                  </label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.salary ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(formData => ({ ...formData, salary: val === "" ? null : parseFloat(val) }));
                    }}
                    className="text-sm h-8 max-w-xs"
                  />
                </div>
                
                {/* --- Skills Section (Updated) --- */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="skills">
                    Skills
                  </label>
                  <Select
                    id="skills"
                    instanceId="skills"
                    isMulti
                    options={skillOptions}
                    // ** CHANGED **: Value prop now filters options based on skill_ids
                    value={skillOptions.filter(option => 
                      formData.skill_ids.includes(option.value)
                    )}
                    // ** CHANGED **: onChange now updates the skill_ids array
                    onChange={(selectedOptions) => {
                      setFormData(prev => ({
                        ...prev,
                        skill_ids: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                      }));
                    }}
                    styles={customStyles}
                    className="text-sm max-w-xs"
                    placeholder="Select skills..."
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="submit" size="sm">
                    Save Changes
                  </Button>
                  <Button
                    type="button" // Important: Prevent form submission
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenEdit(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      );
    },
    enableSorting: false,
  },
];