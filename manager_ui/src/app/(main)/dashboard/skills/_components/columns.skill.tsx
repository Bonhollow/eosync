import { ColumnDef } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteSkill, editSkill } from "../utils/api";
import { skillSchema } from "./schema";

interface SkillUpdatePayload {
  name?: string;
}

export const skillsColumns = (
  refreshData: () => void,
): ColumnDef<z.infer<typeof skillSchema>>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ref" />
    ),
    cell: ({ row }) => <span className="tabular-nums">{row.original.id}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span>{row.original.name}</span>,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const skill = row.original;
      const [openEdit, setOpenEdit] = useState(false);
      const [formData, setFormData] = useState<SkillUpdatePayload>({
        name: skill.name,
      });

      const onSave = async () => {
        await editSkill(skill.id, { name: formData.name ?? "" });
        setOpenEdit(false);
        refreshData();
      };

      const handleDelete = async (skillId: number) => {
        if (window.confirm("Are you sure you want to remove this skill?")) {
          try {
            await deleteSkill(skillId);
            refreshData();
          } catch (error) {
            console.error("Failed to delete skill:", error);
            alert("Failed to delete skill.");
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
                setFormData({ name: skill.name });
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
              onClick={() => handleDelete(skill.id)}
            >
              <Trash className="size-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>

          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Skill</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSave();
                }}
              >
                <div className="grid gap-4 py-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-bold mb-1"
                    >
                      Skill Name *
                    </label>
                    <Input
                      id="name"
                      value={formData.name ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="text-sm h-8"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" size="sm">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
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
