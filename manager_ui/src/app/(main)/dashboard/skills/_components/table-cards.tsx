"use client";

import { useEffect, useState } from "react";
import { getSkills, deleteSkill, createSkill, createSkillsFromFile } from "../utils/api";
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
import { skillsColumns } from "./columns.crm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skill } from "./schema";

export function TableCards() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualSkills, setManualSkills] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);

  useEffect(() => {
    getSkills()
      .then((data) => setSkills(data))
      .catch((err) => console.error("Error while fetching skills:", err))
      .finally(() => setLoading(false));
  }, []);

  const table = useDataTableInstance({
    data: skills,
    columns: skillsColumns,
    getRowId: (row) => row.id.toString(),
  });

  const handleSaveManual = async () => {
    if (!manualSkills.trim()) return;
    const skillsArray = manualSkills
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    try {
      const res = await createSkill(skillsArray); 
      setSkills((prev) => [...prev, ...res]);
      setOpenModal(false);
      setManualSkills("");
    } catch (err) {
      console.error("Error saving skills:", err);
    }
  };


  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await createSkillsFromFile(file);
      setParsedSkills(result.skills || []);
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
          <CardTitle>Skills List</CardTitle>
          <CardDescription>Track and manage your employees' skill list</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm" onClick={() => setOpenModal(true)}>
                Add Skills
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={skillsColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Skills</DialogTitle>
            <DialogDescription>
              Choose how you want to add skills to the database.
            </DialogDescription>
          </DialogHeader>

          {!manualMode && parsedSkills.length === 0 && (
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                onClick={() => setManualMode(true)}
              >
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

          {/* Manual mode */}
          {manualMode && parsedSkills.length === 0 && (
            <div className="flex flex-col gap-4">
              <Textarea
                placeholder="Enter one skill per line"
                value={manualSkills}
                onChange={(e) => setManualSkills(e.target.value)}
                rows={6}
              />
            </div>
          )}

          {/* Parsed skills from AI */}
          {parsedSkills.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Skills detected:</p>
              <ul className="list-disc list-inside">
                {parsedSkills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter>
            {manualMode && parsedSkills.length === 0 && (
              <Button onClick={handleSaveManual}>Save</Button>
            )}
            {parsedSkills.length > 0 && (
              <Button
                onClick={async () => {
                  try {
                    const res = await createSkill(parsedSkills);
                    setSkills((prev) => [...prev, ...res]);
                    setParsedSkills([]);
                    setFile(null);
                    setOpenModal(false);
                  } catch (err) {
                    console.error("Error saving parsed skills:", err);
                  }
                }}
              >
                Save parsed skills
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setManualMode(false);
                setParsedSkills([]);
                setFile(null);
                setOpenModal(false);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
