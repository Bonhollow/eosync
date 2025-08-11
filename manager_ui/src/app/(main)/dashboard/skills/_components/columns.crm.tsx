import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { deleteSkill } from "../utils/api";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { skillSchema } from "./schema";
import { z } from "zod";

export const skillsColumns: ColumnDef<z.infer<typeof skillSchema>>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ref" />,
    cell: ({ row }) => <span className="tabular-nums">{row.original.id}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <span>{row.original.name}</span>,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="text-muted-foreground flex size-8"
        size="icon"
        onClick={() => deleteSkill(parseInt(row.original.id.toString()))}
      >
        <Trash />
        <span className="sr-only">Delete</span>
      </Button>
    ),
    enableSorting: false,
  }
];
