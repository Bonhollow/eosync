import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import z from "zod";
import { deleteSkill } from "../utils/api";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";

import { recentLeadSchema } from "./schema";

export const recentLeadsColumns: ColumnDef<z.infer<typeof recentLeadSchema>>[] = [
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
        onClick={() => deleteSkill(row.original.id)}
      >
        <Trash />
        <span className="sr-only">Delete</span>
      </Button>
    ),
    enableSorting: false,
  }
];
