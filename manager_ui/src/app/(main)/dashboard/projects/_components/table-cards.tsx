"use-client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    createProject,
    createTask,
    deleteProject,
    getProjects,
    generateProject
} from "../utils/api";
import { NewProjectPayload, Project, NewTaskPayload } from "./schema";
import { Bot } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardAction
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { PlusCircle, Pen, Trash } from "lucide-react";
import { getProjectsColumns } from "./columns.project";

type TaskFormData = Omit<NewTaskPayload, "project_id" | "status">;

const initialProjectState: NewProjectPayload = {
  title: "",
  description: null,
  start_date: "",
  end_date: null,
  budget_total: 0,
  tasks: [],
};

export function TableCards() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [openModal, setOpenModal] = useState(false);
  const [newProject, setNewProject] = useState<NewProjectPayload>(initialProjectState);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [taskFormData, setTaskFormData] = useState<TaskFormData | null>(null);

  const [manualMode, setManualMode] = useState(false);
  const [modeSelected, setModeSelected] = useState(false);
  const [step, setStep] = useState(1);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [processingAi, setProcessingAi] = useState(false);


  const fetchProjects = useCallback(() => {
    setLoading(true);
    getProjects()
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error while fetching projects:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = useCallback(async (projectId: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId);
        fetchProjects(); 
      } catch (err) {
        console.error("Failed to delete project:", err);
        alert("Could not delete the project.");
      }
    }
  }, [fetchProjects]);

  const columns = useMemo(
    () =>
      getProjectsColumns({
        onDelete: (project: Project) => handleDeleteProject(project.id),
      }),
    [handleDeleteProject]
  );

  const table = useDataTableInstance({
    data: projects,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  const handleProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? parseFloat(value) || 0 : value;
    setNewProject((prev) => ({ ...prev, [name]: val }));
  };
  
  const openTaskModal = () => setIsTaskModalOpen(true);
  const closeTaskModal = () => {
      setIsTaskModalOpen(false);
      setTimeout(() => {
          setTaskFormData(null);
          setEditingTaskIndex(null);
      }, 300);
  };

  const handleAddTask = () => {
    setEditingTaskIndex(null);
    setTaskFormData({
      title: "",
      description: null,
      start_date: "",
      end_date: null,
      estimated_hours: 0,
    });
    openTaskModal();
  };
  
  const handleEditTask = (index: number) => {
    const task = newProject.tasks![index];
    setTaskFormData({
        title: task.title,
        description: task.description,
        start_date: task.start_date,
        end_date: task.end_date,
        estimated_hours: task.estimated_hours,
    });
    setEditingTaskIndex(index);
    openTaskModal();
  };
  
  const handleRemoveTask = (index: number) => {
    setNewProject(prev => ({ ...prev, tasks: prev.tasks?.filter((_, i) => i !== index) }));
  };
  
  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const val = type === 'number' ? parseFloat(value) : value;
      setTaskFormData(prev => prev ? ({ ...prev, [name]: val }) : null);
  };

  const handleSaveOrUpdateTask = () => {
    if (!taskFormData?.title || !taskFormData.start_date) {
        alert("Task title and start date are required.");
        return;
    }
    const currentTasks = newProject.tasks || [];
    
    const taskToSave: TaskFormData = {
        ...taskFormData,
        end_date: taskFormData.end_date || null,
        estimated_hours: Number(taskFormData.estimated_hours) || 0,
    };

  const updatedTasks: NonNullable<NewProjectPayload["tasks"]> =
    editingTaskIndex !== null
      ? currentTasks.map((task, i) =>
          i === editingTaskIndex
            ? { ...task, ...taskToSave, assignments: task.assignments ?? [] }
            : task
        )
      : [
          ...currentTasks,
          {
            ...taskToSave,
            status: "To Do",
            assignments: [],
          },
        ];
    
          
    setNewProject(prev => ({ ...prev, tasks: updatedTasks }));
    closeTaskModal();
  };

  const handleSaveProjectAndTasks = async () => {
    if (!newProject.title || !newProject.start_date) {
      alert("Project Title and Start Date are required.");
      return;
    }
    try {
      const { tasks, ...projectPayload } = newProject;
      const createdProject = await createProject(projectPayload);

      if (tasks && tasks.length > 0 && createdProject.id) {
        const taskCreationPromises = tasks.map(task => 
          createTask({ 
            ...task, 
            status: 'To Do', 
            project_id: createdProject.id 
          })
        );
        await Promise.all(taskCreationPromises);
      }
      fetchProjects();
      closeModal();
    } catch (err) {
      console.error("Error saving project and tasks:", err);
      alert("Failed to save the project. Please check the console for details.");
    }
  };

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) {
      alert("Please describe the project first.");
      return;
    }
    setProcessingAi(true);
    try {
      const aiProject = await generateProject(aiPrompt);

      if (!aiProject) {
        alert("The AI could not generate project details from your description. Please try again.");
        return;
      }
      
      const projectFromAi: NewProjectPayload = {
        ...initialProjectState,
        title: aiProject.title,
        description: aiProject.description || null,
      };

      setNewProject(projectFromAi);
      
      setManualMode(true);
      setStep(1); 

    } catch (err) {
      console.error("Error processing with AI:", err);
      alert("An error occurred while communicating with the AI. Please try again.");
    } finally {
      setProcessingAi(false);
    }
  };
  
  
  const closeModal = () => {
    setOpenModal(false);
    setTimeout(() => {
      setNewProject(initialProjectState);
      setManualMode(false);
      setModeSelected(false);
      setAiPrompt("");
      setTaskFormData(null);
      setEditingTaskIndex(null);
      setStep(1); 
    }, 300);
  };
  
  const handleModalOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setOpenModal(true);
    } else {
      closeModal();
    }
  };

  if (loading) return <p>Loading...</p>;
  
  const renderModeSelection = () => (
    <div className="flex flex-col gap-4 py-6">
      <Button variant="outline" onClick={() => { setManualMode(true); setModeSelected(true); }}>
        Manually Add Project
      </Button>
      <Button onClick={() => { setManualMode(false); setModeSelected(true); }}>
        <Bot className="mr-2 size-4" /> Create Project with AI Assist
      </Button>
    </div>
  );

  const renderAiAssist = () => (
    <div className="flex flex-col gap-4 py-4">
      <Label htmlFor="ai-prompt">Project Description</Label>
      <Textarea id="ai-prompt" placeholder="Describe the project..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={8} />
    </div>
  );
  
  const renderManualForm = () => {
    if (step === 1) {
      return renderProjectDetailsStep();
    }
    if (step === 2) {
      return renderTasksStep();
    }
  };

  const renderProjectDetailsStep = () => (
    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="space-y-2">
            <Label htmlFor="title">Project Title <span className="text-red-500">*</span></Label>
            <Input id="title" name="title" value={newProject.title} onChange={handleProjectInputChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={newProject.description || ""} onChange={handleProjectInputChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="start_date">Start Date <span className="text-red-500">*</span></Label>
                <Input id="start_date" name="start_date" type="date" value={newProject.start_date} onChange={handleProjectInputChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" value={newProject.end_date || ""} onChange={handleProjectInputChange} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="budget_total">Budget ($) <span className="text-red-500">*</span></Label>
            <Input id="budget_total" name="budget_total" type="number" value={newProject.budget_total} onChange={handleProjectInputChange} required />
        </div>
    </div>
  );

  const renderTasksStep = () => (
      <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-lg">Project Tasks</h3>
              <p className="text-sm text-muted-foreground">Add or manage tasks for this project.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddTask}>
                <PlusCircle className="mr-2 h-4 w-4"/> Add Task
            </Button>
        </div>
        <div className="space-y-2">
            {newProject.tasks?.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-background">
                    <span className="font-medium">{task.title}</span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTask(index)}><Pen className="h-4 w-4 text-muted-foreground"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTask(index)}><Trash className="h-4 w-4 text-destructive"/></Button>
                    </div>
                </div>
            ))}
            {(!newProject.tasks || newProject.tasks.length === 0) && (
                <div className="text-center py-6 border-2 border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground">No tasks added yet.</p>
                    <p className="text-xs text-muted-foreground">Click "Add Task" to get started.</p>
                </div>
            )}
        </div>
        <Button variant="link" onClick={() => setStep(1)} className="px-0 mt-4">Back to Project Details</Button>
      </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="shadow-xs">
        <CardHeader className="flex-row items-start justify-between">
          <CardTitle>Projects List</CardTitle>
          <CardDescription>Track and manage your company's projects</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button variant="outline" size="sm">Export</Button>
              <Button size="sm" onClick={() => setOpenModal(true)}>Add Projects</Button>
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

      <Dialog open={openModal} onOpenChange={handleModalOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {manualMode ? `Add New Project - Step ${step} of 2` : 'Add New Project'}
            </DialogTitle>
            <DialogDescription>
              {!modeSelected
                ? "Choose how you want to add a project."
                : manualMode
                ? (step === 1 ? "Fill in the core details for your new project." : "Add and manage the project's tasks.")
                : "Describe the project and let AI fill in the details."}
            </DialogDescription>
          </DialogHeader>
          
          {!modeSelected ? renderModeSelection() : manualMode ? renderManualForm() : renderAiAssist()}

          <DialogFooter className="pt-4">
            {modeSelected && (
              <Button variant="outline" onClick={() => { setModeSelected(false); setStep(1); }}>Back</Button>
            )}
            <DialogClose asChild>
                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            </DialogClose>
            {modeSelected && manualMode && (
              <>
                {step === 1 && <Button onClick={() => setStep(2)}>Next</Button>}
                {step === 2 && <Button onClick={handleSaveProjectAndTasks}>Save Project</Button>}
              </>
            )}
            {modeSelected && !manualMode && (
              <Button onClick={handleAiAssist} disabled={processingAi}>
                {processingAi ? "Processing..." : "Process with AI"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingTaskIndex !== null ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                  <DialogDescription>Fill in the details for the task below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <Input placeholder="Task Title*" name="title" value={taskFormData?.title || ""} onChange={handleTaskFormChange} />
                  <Textarea placeholder="Task Description" name="description" value={taskFormData?.description || ""} onChange={handleTaskFormChange} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" placeholder="Start Date*" name="start_date" value={taskFormData?.start_date || ""} onChange={handleTaskFormChange} />
                    <Input type="date" placeholder="End Date" name="end_date" value={taskFormData?.end_date || ""} onChange={handleTaskFormChange} />
                  </div>
                  <Input 
                    type="number"
                    placeholder="Estimated Hours"
                    name="estimated_hours"
                    value={taskFormData?.estimated_hours ?? ''}
                    onChange={handleTaskFormChange}
                  />
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={closeTaskModal}>Cancel</Button>
                  <Button onClick={handleSaveOrUpdateTask}>
                    {editingTaskIndex !== null ? 'Save Changes' : 'Save Task'}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}