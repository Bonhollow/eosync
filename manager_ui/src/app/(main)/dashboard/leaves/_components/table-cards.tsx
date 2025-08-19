"use client";

import { useEffect, useState } from "react";
import { getLeaves, createLeave, deleteLeave, updateLeave, getEmployees } from "../utils/api";
import { Leave, LeaveCreate, LeaveUpdate, leaveCreateSchema, Employee } from "./schema";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction
} from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { getLeaveColumns } from "./columns.leave";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

export function TableCards() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentLeave, setCurrentLeave] = useState<Partial<LeaveCreate & {id?: number}>>({});
  const [formErrors, setFormErrors] = useState<any>({});


  const fetchLeavesAndEmployees = () => {
    setLoading(true);
    Promise.all([getLeaves(), getEmployees()])
      .then(([leavesData, employeesData]) => {
        setLeaves(leavesData);
        setEmployees(employeesData);
      })
      .catch((err) => console.error("Error while fetching data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeavesAndEmployees();
  }, []);

  const columns = getLeaveColumns();

  const table = useDataTableInstance({
    data: leaves,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  const handleOpenModal = () => {
    setCurrentLeave({});
    setFormErrors({});
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
        const payload = {
            ...currentLeave,
            reason: currentLeave.reason || null
        };
        const validatedData = leaveCreateSchema.parse(payload);
        await createLeave(validatedData);
        fetchLeavesAndEmployees(); 
        setOpenModal(false);
    } catch(error) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.flatten().fieldErrors);
      } else {
        console.error("Error during request", error);
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Leave requests</CardTitle>
          <CardDescription>Track and manage employee leave requests</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm" onClick={handleOpenModal}>
                Add Leave Request
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Make a new request</DialogTitle>
            <DialogDescription>
              Fill in the details to submit a new request.
            </DialogDescription>
          </DialogHeader>

            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="employee" className="text-right">Employee</Label>
                    <Select
                        value={currentLeave.employee_id?.toString()}
                        onValueChange={(value) => setCurrentLeave(prev => ({...prev, employee_id: Number(value)}))}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>{emp.first_name} {emp.last_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {formErrors.employee_id && <p className="col-span-4 text-red-500 text-sm text-right">{formErrors.employee_id[0]}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select
                        value={currentLeave.type}
                        onValueChange={(value: 'Vacation' | 'Sick' | 'Other') => setCurrentLeave(prev => ({...prev, type: value}))}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a type of leave" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Vacation">Vacation</SelectItem>
                            <SelectItem value="Sick">Sick</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start_date" className="text-right">Start Date</Label>
                    <Input id="start_date" type="date" value={currentLeave.start_date || ''} onChange={e => setCurrentLeave(prev => ({...prev, start_date: e.target.value}))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end_date" className="text-right">End Date</Label>
                    <Input id="end_date" type="date" value={currentLeave.end_date || ''} onChange={e => setCurrentLeave(prev => ({...prev, end_date: e.target.value}))} className="col-span-3" />
                </div>
                <div>
                  <label htmlFor="approved" className="flex items-center gap-2 text-sm font-bold">
                    <Input
                      type="checkbox"
                      id="approved"
                      checked={currentLeave.approved || false}
                      onChange={(e) =>
                        setCurrentLeave(prev => ({...prev, approved: e.target.checked}))
                      }
                      className="size-4"
                    />
                    Approved
                  </label>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">Reason</Label>
                    <Textarea id="reason" value={currentLeave.reason || ''} onChange={e => setCurrentLeave(prev => ({...prev, reason: e.target.value}))} className="col-span-3" placeholder="Motivo (opzionale)"/>
                </div>
            </div>

          <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}