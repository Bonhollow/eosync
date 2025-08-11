"use client";

import { useEffect, useState } from "react";

import { 
  getEmployees, 
  createEmployee, 
  createEmployeesFromFile,
  getSkills
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

import { employeesColumns } from "./columns.crm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Employee, EmployeeCreate } from "./schema";

export function TableCards() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedEmployees, setParsedEmployees] = useState<Employee[]>([]);

  const [manualEmployee, setManualEmployee] = useState<EmployeeCreate>({
    first_name: null,
    last_name: "",
    birth_date: null,
    email: null,
    phone: null,
    hire_date: null,
    role: "",
    department: null,
    salary: 0,
    skills: [],
  });

const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getEmployees()
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error while fetching employees:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getSkills()
      .then(setAvailableSkills)
      .catch((e) => console.error("Error fetching skills:", e));
  }, []);

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
      // Backend probabilmente aspetta un array, quindi:
      const res = await createEmployee([manualEmployee]);
      setEmployees((prev) => [...prev, ...res]);
      setOpenModal(false);
      setManualMode(false);
      // Reset form
      setManualEmployee({
        first_name: "",
        last_name: "",
        birth_date: "",
        email: "",
        phone: "",
        hire_date: "",
        role: "",
        department: "",
        salary: 0,
        skills: [],
      });
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("Error saving employee. Check console.");
    }
  };

  // File upload handler (rimosso parse manuale perché non usi textarea)
  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await createEmployeesFromFile(file);
      setParsedEmployees(result);
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
                Add
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

      {/* Modal */}
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
                  Supported formats: PDF, DOCX, XLSX, PPTX, Markdown, AsciiDoc, HTML, CSV, PNG, JPEG, TIFF, BMP, WEBP, XML
                </p>
                <Button onClick={handleFileUpload} disabled={!file || uploading}>
                  {uploading ? "Processing..." : "Import file and elaborate with AI"}
                </Button>
              </div>
            </div>
          )}

          {/* Manual mode with compact form */}
          {manualMode && parsedEmployees.length === 0 && (
            <form 
              className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-4" 
              onSubmit={(e) => { e.preventDefault(); handleSaveManual(); }}
            >
              {/* First Name - Optional */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="first_name">
                  First Name <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="first_name"
                  placeholder="First name"
                  value={manualEmployee.first_name ?? ""}
                  onChange={(e) => setManualEmployee(prev => ({ ...prev, first_name: e.target.value }))}
                  className="text-sm h-8"
                />
              </div>

              {/* Last Name - Required */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1" htmlFor="last_name">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="last_name"
                  placeholder="Last name"
                  value={manualEmployee.last_name ?? ""}
                  onChange={(e) => setManualEmployee(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                  className="text-sm h-8"
                />
              </div>

              {/* Birth Date - Optional */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="birth_date">
                  Birth Date <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="birth_date"
                  type="date"
                  value={manualEmployee.birth_date ?? ""}
                  onChange={(e) => setManualEmployee(prev => ({ ...prev, birth_date: e.target.value }))}
                  className="text-sm h-8"
                />
              </div>

              {/* Email - Optional */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="email">
                  Email <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={manualEmployee.email ?? ""}
                  onChange={(e) => setManualEmployee(prev => ({ ...prev, email: e.target.value }))}
                  className="text-sm h-8"
                />
              </div>

              {/* Phone - Optional */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="phone">
                  Phone <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  value={manualEmployee.phone ?? ""}
                  onChange={(e) => setManualEmployee(prev => ({ ...prev, phone: e.target.value }))}
                  className="text-sm h-8"
                />
              </div>

              {/* Hire Date - Optional */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="hire_date">
                  Hire Date <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="hire_date"
                  type="date"
                  value={manualEmployee.hire_date ?? ""}
                  onChange={(e) => setManualEmployee(prev => ({ ...prev, hire_date: e.target.value }))}
                  className="text-sm h-8"
                />
              </div>

              {/* Role - Required */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1" htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </label>
                <Input
                  id="role"
                  placeholder="Job role"
                  value={manualEmployee.role ?? ""}
                  onChange={(e) => setManualEmployee(prev => ({ ...prev, role: e.target.value }))}
                  required
                  className="text-sm h-8"
                />
              </div>

              {/* Department - Optional */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="department">
                  Department <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="department"
                  placeholder="Department"
                  value={manualEmployee.department ?? ""}
                  onChange={(e) => setManualEmployee(prev => ({ ...prev, department: e.target.value }))}
                  className="text-sm h-8"
                />
              </div>

              {/* Salary - Full width on all screens */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="salary">
                  Salary <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={manualEmployee.salary ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setManualEmployee(prev => ({ ...prev, salary: val === "" ? 0 : parseFloat(val) }));
                  }}
                  className="text-sm h-8 max-w-xs"
                />
              </div>

              {/* Required fields info - Full width */}
              <div className="md:col-span-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                <span className="font-medium">*</span> Required fields
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="submit" size="sm">Save</Button>
                <Button variant="ghost" size="sm" onClick={() => setManualMode(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}


          {/* Parsed employees from file upload */}
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
                    const res = await createEmployee(parsedEmployees);
                    setEmployees((prev) => [...prev, ...res]);
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
                  setOpenModal(false);
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
