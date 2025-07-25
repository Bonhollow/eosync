"use client";

import { useEffect, useState } from "react";
import { getSkills, deleteSkill } from "../utils/api"
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { recentLeadsColumns } from "./columns.crm";

export function TableCards() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkills()
      .then((data) => setSkills(data))
      .catch((err) => console.error("Error while fetching skills:", err))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: skills,
    columns: recentLeadsColumns,
    getRowId: (row) => row.id.toString(),
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Skills List</CardTitle>
          <CardDescription>Track and manage your employees' skill list</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={recentLeadsColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
    </div>
  );
}
