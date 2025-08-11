import { ColumnDef } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";

import { Employee } from "./schema";
import { deleteEmployee, editEmployee } from "../utils/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


export const employeesColumns: ColumnDef<Employee>[] = [
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
    accessorKey: "skills",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Skills" />,
    cell: ({ row }) => (
      <span>
        {row.original.skills ? row.original.skills.toString() : "-"}
      </span>
    ),
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
    cell: ({ row }) => {
      const employee: Employee = row.original;
      const [openEdit, setOpenEdit] = useState(false);
      const [formData, setFormData] = useState<Employee>({ ...employee });

      const onSave = async () => {
        await editEmployee(employee.id, formData);
        setOpenEdit(false);
        // Puoi aggiungere callback per refresh esterno se serve
      };

      return (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => deleteEmployee(employee.id)}
            >
              <Trash />
              <span className="sr-only">Delete</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setOpenEdit(true)}
            >
              <Pen />
              <span className="sr-only">Edit</span>
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
                    Birth Date <span className="text-xs text-gray-400">(optional)</span>
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
                    Email <span className="text-xs text-gray-400">(optional)</span>
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
                    Phone <span className="text-xs text-gray-400">(optional)</span>
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
                    Hire Date <span className="text-xs text-gray-400">(optional)</span>
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
                    Role <span className="text-red-500">*</span>
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
                    Department <span className="text-xs text-gray-400">(optional)</span>
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
                    Salary <span className="text-xs text-gray-400">(optional)</span>
                  </label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.salary ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(formData => ({ ...formData, salary: val === "" ? 0 : parseFloat(val) }));
                    }}
                    className="text-sm h-8 max-w-xs"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                  <Button
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