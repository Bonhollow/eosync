"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getEmployees,
  createEmployee,
  createEmployeesFromFile,
  getSkills,
} from "../utils/api";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import Select from "react-select";
import { getEmployeesColumns } from "./columns.employee";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Employee } from "./schema";
import { Bot } from "lucide-react";

export interface EmployeeCreate {
  first_name: string | null;
  last_name: string;
  birth_date: string | null;
  email: string | null;
  phone: string | null;
  hire_date: string | null;
  role: string;
  department: string | null;
  salary: number | null;
  skill_ids: number[];
}

export function TableCards() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedEmployees, setParsedEmployees] = useState<Employee[]>([]);

  const initialManualEmployeeState: EmployeeCreate = {
    first_name: null,
    last_name: "",
    birth_date: null,
    email: null,
    phone: null,
    hire_date: null,
    role: "",
    department: null,
    salary: 0,
    skill_ids: [],
  };

  const [manualEmployee, setManualEmployee] = useState<EmployeeCreate>(
    initialManualEmployeeState,
  );

  const [availableSkills, setAvailableSkills] = useState<
    { id: number; name: string }[]
  >([]);

  const fetchEmployees = useCallback(() => {
    getEmployees()
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error while fetching employees:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    getSkills()
      .then(setAvailableSkills)
      .catch((e) => console.error("Error fetching skills:", e));
  }, []);

  const skillOptions = availableSkills.map((skill) => ({
    value: skill.id,
    label: skill.name,
  }));

  const employeesColumns = useMemo(
    () => getEmployeesColumns(skillOptions, fetchEmployees),
    [skillOptions, fetchEmployees],
  );

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "32px",
      height: "auto",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
      borderColor: state.isFocused ? "#a5b4fc" : "#d1d5db",
      ":hover": {
        borderColor: "#9ca3af",
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      minHeight: "32px",
      padding: "0 6px",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: "32px",
    }),
  };

  const table = useDataTableInstance({
    data: employees,
    columns: employeesColumns,
    getRowId: (row) => row.id.toString(),
  });

  const handleSaveManual = async () => {
    if (!manualEmployee.last_name || !manualEmployee.role) {
      alert("Last name and role are required.");
      return;
    }

    try {
      await createEmployee([manualEmployee]);
      fetchEmployees();
      setOpenModal(false);
      setManualMode(false);
      setManualEmployee(initialManualEmployeeState);
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("Error saving employee. Check console.");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await createEmployeesFromFile(file);
      fetchEmployees();
      setOpenModal(false);
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Employees List</CardTitle>
          <CardDescription>Track and manage your employees</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm" onClick={() => setOpenModal(true)}>
                Add Employees
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={employeesColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Employees</DialogTitle>
            <DialogDescription>
              Choose how you want to add employees to the database.
            </DialogDescription>
          </DialogHeader>

          {!manualMode && parsedEmployees.length === 0 && (
            <div className="flex flex-col gap-4">
              <Button variant="outline" onClick={() => setManualMode(true)}>
                Manually insert
              </Button>

              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept=".pdf,.docx,.xlsx,.pptx,.md,.asciidoc,.html,.csv,.png,.jpg,.jpeg,.tiff,.bmp,.webp,.xml"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOCX, XLSX, PPTX, Markdown, AsciiDoc,
                  HTML, CSV, PNG, JPEG, TIFF, BMP, WEBP, XML
                </p>
                <Button
                  onClick={handleFileUpload}
                  disabled={!file || uploading}
                >
                  <Bot className="mr-2 size-4" />{" "}
                  {uploading
                    ? "Processing..."
                    : "Import file and elaborate with AI"}
                </Button>
              </div>
            </div>
          )}

          {manualMode && parsedEmployees.length === 0 && (
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveManual();
              }}
            >
              <div>
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="first_name"
                >
                  First Name{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="first_name"
                  placeholder="First name"
                  value={manualEmployee.first_name ?? ""}
                  onChange={(e) =>
                    setManualEmployee((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  className="text-sm h-8"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-gray-900 mb-1"
                  htmlFor="last_name"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="last_name"
                  placeholder="Last name"
                  value={manualEmployee.last_name ?? ""}
                  onChange={(e) =>
                    setManualEmployee((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  required
                  className="text-sm h-8"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="birth_date"
                >
                  Birth Date{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="birth_date"
                  type="date"
                  value={manualEmployee.birth_date ?? ""}
                  onChange={(e) =>
                    setManualEmployee((prev) => ({
                      ...prev,
                      birth_date: e.target.value,
                    }))
                  }
                  className="text-sm h-8"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="email"
                >
                  Email{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={manualEmployee.email ?? ""}
                  onChange={(e) =>
                    setManualEmployee((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="text-sm h-8"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="phone"
                >
                  Phone{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  value={manualEmployee.phone ?? ""}
                  onChange={(e) =>
                    setManualEmployee((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="text-sm h-8"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="hire_date"
                >
                  Hire Date{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="hire_date"
                  type="date"
                  value={manualEmployee.hire_date ?? ""}
                  onChange={(e) =>
                    setManualEmployee((prev) => ({
                      ...prev,
                      hire_date: e.target.value,
                    }))
                  }
                  className="text-sm h-8"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-gray-900 mb-1"
                  htmlFor="role"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <Input
                  id="role"
                  placeholder="Job role"
                  value={manualEmployee.role ?? ""}
                  onChange={(e) =>
                    setManualEmployee((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  required
                  className="text-sm h-8"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="department"
                >
                  Department{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="department"
                  placeholder="Department"
                  value={manualEmployee.department ?? ""}
                  onChange={(e) =>
                    setManualEmployee((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className="text-sm h-8"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="salary"
                >
                  Salary{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={manualEmployee.salary ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setManualEmployee((prev) => ({
                      ...prev,
                      salary: val === "" ? null : parseFloat(val),
                    }));
                  }}
                  className="text-sm h-8 max-w-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="key-skills"
                >
                  Key Skills{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Select
                  id="key-skills"
                  instanceId="key-skills"
                  isMulti
                  options={skillOptions}
                  value={skillOptions.filter((option) =>
                    manualEmployee.skill_ids.includes(option.value),
                  )}
                  onChange={(selectedOptions) => {
                    setManualEmployee((prev) => ({
                      ...prev,
                      skill_ids: selectedOptions
                        ? selectedOptions.map((opt) => Number(opt.value))
                        : [],
                    }));
                  }}
                  styles={customSelectStyles}
                  className="text-sm max-w-xs"
                  placeholder="Select skills..."
                />
              </div>

              <div className="md:col-span-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                <span className="font-medium">*</span> Required fields
              </div>
              <div className="flex gap-2 justify-end pt-2 md:col-span-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setManualMode(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </form>
          )}

          {parsedEmployees.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Employees detected:</p>
              <ul className="list-disc list-inside">
                {parsedEmployees.map((emp, i) => (
                  <li key={i}>
                    {emp.first_name} {emp.last_name} - {emp.email}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsedEmployees.length > 0 && (
            <DialogFooter>
              <Button
                onClick={async () => {
                  try {
                    await createEmployee(parsedEmployees);
                    fetchEmployees();
                    setParsedEmployees([]);
                    setOpenModal(false);
                  } catch (err) {
                    console.error("Error saving parsed employees:", err);
                    alert("Error saving employees. Check console.");
                  }
                }}
              >
                Save parsed employees
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setParsedEmployees([]);
                  setFile(null);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
