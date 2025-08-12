"use client"; 

import { ColumnDef } from "@tanstack/react-table";
import { ListChecks, Pen, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask, deleteTask, updateTask, editProject } from "../utils/api";
import { projectSchema, taskSchema } from "./schema";


// Define the types from your Zod schemas
type Project = z.infer<typeof projectSchema>;
type Task = z.infer<typeof taskSchema>;
type NewTaskPayload = Omit<Task, "id">;

// Define the shape of the props our function will accept
interface GetProjectsColumnsProps {
  onDelete: (project: Project) => void;
}

// --- Helper Component: Project Edit Modal ---
interface ProjectEditModalProps {
  project: Project;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onProjectUpdate: () => void; // Callback to refresh data
}

const ProjectEditModal = ({ project, isOpen, onOpenChange, onProjectUpdate }: ProjectEditModalProps) => {
  const [formData, setFormData] = useState(project);

  useEffect(() => {
    // Keep form data in sync if the project prop changes
    setFormData(project);
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await editProject(project.id, {
        ...formData,
        // Ensure budget is a number and tasks are not part of the payload
        budget_total: Number(formData.budget_total)
      });
      onOpenChange(false); // Close the modal
      onProjectUpdate();   // Trigger data refresh
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Failed to save changes.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project: {project.title}</DialogTitle>
          <DialogDescription>
            Make changes to your project here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={formData.title} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={formData.description || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_date" className="text-right">Start Date</Label>
            <Input id="start_date" type="date" value={new Date(formData.start_date).toISOString().split('T')[0]} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_date" className="text-right">End Date</Label>
            <Input id="end_date" type="date" value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget_total" className="text-right">Budget</Label>
            <Input id="budget_total" type="number" value={formData.budget_total} onChange={handleInputChange} className="col-span-3" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// The file now exports a function that returns the column definitions
export const getProjectsColumns = ({ onDelete }: GetProjectsColumnsProps): ColumnDef<Project>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Title" />
    ),
    cell: ({ row }) => <span>{row.original.title}</span>,
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => new Date(row.original.start_date).toLocaleDateString(),
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const endDate = row.original.end_date;
      return endDate ? (
        new Date(endDate).toLocaleDateString()
      ) : (
        <Badge variant="outline">Ongoing</Badge>
      );
    },
  },
  {
    id: "tasks",
    header: "Tasks",
    cell: ({ row }) => {
      // The task modal logic remains here as it's self-contained.
      const project = row.original;
      const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingTask, setEditingTask] = useState<Task | null>(null);

      const emptyTask: NewTaskPayload = {
        project_id: project.id,
        title: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        estimated_hours: 0,
        status: "To Do",
      };

      const [formData, setFormData] = useState<NewTaskPayload | Task>(emptyTask);

      useEffect(() => {
        if (editingTask) {
          setFormData(editingTask);
          setIsFormOpen(true);
        } else {
          setFormData(emptyTask);
        }
      }, [editingTask]);

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
      };

      const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          if (editingTask) {
            const updatedTask = await updateTask(editingTask.id, formData);
            setTasks(tasks.map((task) => task.id === editingTask.id ? updatedTask : task));
          } else {
            const newTask = await createTask(formData as NewTaskPayload);
            setTasks([...tasks, newTask]);
          }
          setEditingTask(null);
          setIsFormOpen(false);
          setFormData(emptyTask);
        } catch (error) {
          console.error("Failed to save the task:", error);
          alert("Failed to save task.");
        }
      };

      const handleDeleteTask = async (taskId: number) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
          try {
            await deleteTask(taskId);
            setTasks(tasks.filter((task) => task.id !== taskId));
          } catch (error) {
            console.error("Failed to delete the task:", error);
            alert("Failed to delete task.");
          }
        }
      };

      const handleAddNewClick = () => {
        setEditingTask(null);
        setFormData(emptyTask);
        setIsFormOpen(true);
      };

      return (
        <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            // Reload the entire page when the modal is closed to ensure all data is fresh
            if (!open) window.location.reload();
          }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ListChecks className="size-4" />
              <Badge variant="secondary" className="px-2">{tasks.length}</Badge>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tasks for: {project.title}</DialogTitle>
              <DialogDescription>Manage all tasks associated with this project.</DialogDescription>
            </DialogHeader>

            <div className="flex justify-end mb-4">
              {!isFormOpen && (
                <Button size="sm" onClick={handleAddNewClick}>
                  <Plus className="mr-2 size-4" /> Add New Task
                </Button>
              )}
            </div>

            {isFormOpen && (
              <form onSubmit={handleSaveTask} className="p-4 mb-6 border rounded-lg bg-muted/50">
                <h3 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                <div className="grid gap-4">
                  <Input id="title" placeholder="Task Title" value={formData.title} onChange={handleInputChange} required />
                  <Textarea id="description" placeholder="Task Description" value={formData.description || ''} onChange={handleInputChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="start_date" type="date" value={new Date(formData.start_date).toISOString().split('T')[0]} onChange={handleInputChange} required />
                    <Input id="end_date" type="date" value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''} onChange={handleInputChange} />
                  </div>
                  <Input id="estimated_hours" type="number" placeholder="Estimated Hours" value={formData.estimated_hours ?? ''} onChange={handleInputChange} />                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingTask ? 'Save Changes' : 'Create Task'}</Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Badge variant={task.status === 'Done' ? 'default' : 'secondary'}>{task.status}</Badge>
                     <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setEditingTask(task)}><Pen className="size-4" /></Button>
                     <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTask(task.id)}><Trash className="size-4" /></Button>
                  </div>
                </div>
              ))}
               {tasks.length === 0 && !isFormOpen && (
                <p className="text-center text-muted-foreground py-4">No tasks found for this project.</p>
               )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "budget_total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Budget" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("budget_total"));
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original;
      const [isEditModalOpen, setIsEditModalOpen] = useState(false);

      // Reload the page to see updated project data.
      const handleProjectUpdate = () => {
        window.location.reload();
      };
      
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pen className="size-4" />
            <span className="sr-only">Edit</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(project)}
          >
            <Trash className="size-4" />
            <span className="sr-only">Delete</span>
          </Button>
          
          {/* The Edit Modal is rendered here but only visible when isEditModalOpen is true */}
          <ProjectEditModal
              project={project}
              isOpen={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              onProjectUpdate={handleProjectUpdate}
          />
        </div>
      );
    },
    enableSorting: false,
  },
];