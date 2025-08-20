"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Leave, LeaveUpdate } from "./schema";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { updateLeave, deleteLeave } from "../utils/api";

type LeaveFormData = Omit<Leave, "id" | "employee">;

export const getLeaveColumns = (refreshData: () => void): ColumnDef<Leave>[] => [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => {
        const employee = row.original.employee;
        return <div>{`#${employee.id} ${employee.last_name}`}</div>
    }
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
  },
  {
    accessorKey: "end_date",
    header: "End Date",
  },
  {
    accessorKey: "reason",
    header: "Reason",
  },
  {
    accessorKey: "approved",
    header: "Status",
    cell: ({ row }) => {
        const isApproved = row.getValue("approved");
        return <Badge variant={isApproved ? "default" : "secondary"}>{isApproved ? "Approved" : "Pending"}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const leave = row.original;
      const [openEdit, setOpenEdit] = useState(false);
      
      const [formData, setFormData] = useState<LeaveFormData>({
        type: leave.type,
        start_date: leave.start_date,
        end_date: leave.end_date,
        approved: leave.approved,
        reason: leave.reason,
      });

      const onSave = async () => {
        const updatedLeaveData: LeaveUpdate = {
          ...formData
        };

        try {
          await updateLeave(leave.id, updatedLeaveData);

          setOpenEdit(false);
          refreshData();

        } catch (error) {
          console.error("Failed to update leave:", error);
          alert("Failed to save changes. Please try again.");
        }
      };

      const handleDelete = async (leaveId: number) => {
        if (window.confirm("Are you sure you want to remove this leave?")) {
          try {
            await deleteLeave(leaveId);
            
            refreshData();

          } catch (error) {
            console.error("Failed to delete leave:", error);
            alert("Failed to delete leave.");
          }
        }
      };

      return (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => {
                setFormData({
                  type: leave.type,
                  start_date: leave.start_date,
                  end_date: leave.end_date,
                  approved: leave.approved,
                  reason: leave.reason,
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
              className="text-destructive"
              onClick={() => handleDelete(leave.id)}
            >
              <Trash className="size-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>

          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Leave</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSave();
                }}
              >
                <div className="grid gap-4 py-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-bold mb-1">
                      Leave Type *
                    </label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "Vacation" | "Sick" | "Other") => {
                        setFormData({ ...formData, type: value });
                      }}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select a leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vacation">Vacation</SelectItem>
                        <SelectItem value="Sick">Sick</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-bold mb-1">
                      Start Date *
                    </label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      required
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-bold mb-1">
                      End Date *
                    </label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      required
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="approved" className="flex items-center gap-2 text-sm font-bold">
                      <Input
                        type="checkbox"
                        id="approved"
                        checked={formData.approved}
                        onChange={(e) =>
                          setFormData({ ...formData, approved: e.target.checked })
                        }
                        className="size-4"
                      />
                      Approved
                    </label>
                  </div>
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-bold mb-1">
                      Reason
                    </label>
                    <Input
                      id="reason"
                      type="text"
                      value={formData.reason || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenEdit(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Changes
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