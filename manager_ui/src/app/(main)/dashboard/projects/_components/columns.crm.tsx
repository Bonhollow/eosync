"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ListChecks, Pen, Plus, Trash, Users, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import {
    createAssignment,
    createTask,
    deleteAssignment,
    deleteTask,
    editProject,
    getEmployees,
    updateTask,
    automateTaskAssignment
} from "../utils/api";
import { Assignment, Employee, NewAssignmentPayload, Project, Task } from "./schema";

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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ProjectEditModalProps = {
    project: Project;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onProjectUpdate: () => void;
};

const ProjectEditModal = ({ project, isOpen, onOpenChange, onProjectUpdate }: ProjectEditModalProps) => {
    const [formData, setFormData] = useState(project);

    useEffect(() => {
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
                budget_total: Number(formData.budget_total)
            });
            onOpenChange(false);
            onProjectUpdate();
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

type AssignmentsModalProps = {
    task: Task;
    employees: Employee[];
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onUpdate: () => void;
};

const AssignmentsModal = ({ task, employees, isOpen, onOpenChange, onUpdate }: AssignmentsModalProps) => {
    const [assignments, setAssignments] = useState<Assignment[]>(task.assignments || []);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const emptyPayload: NewAssignmentPayload = {
        task_id: task.id,
        employee_id: 0,
        assigned_hours: 0,
        role_on_task: ""
    };

    const [formData, setFormData] = useState<NewAssignmentPayload>(emptyPayload);

    useEffect(() => {
        setAssignments(task.assignments || []);
    }, [task]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.employee_id) {
            alert("Please select an employee.");
            return;
        }

        try {
            await createAssignment(formData);
            onUpdate();
            setIsFormOpen(false);
            setFormData(emptyPayload);
        } catch (error) {
            console.error("Failed to save assignment:", error);
            alert("Failed to save assignment. The employee might already be assigned to this task.");
        }
    };

    const handleDelete = async (employeeId: number, taskId: number) => {
        if (window.confirm("Are you sure you want to remove this assignment?")) {
            try {
                await deleteAssignment(employeeId, taskId);
                onUpdate();
            } catch (error) {
                console.error("Failed to delete assignment:", error);
                alert("Failed to delete assignment.");
            }
        }
    };
    
    const availableEmployees = employees.filter(emp => !assignments.some(a => a.employee_id === emp.id));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assignments for: {task.title}</DialogTitle>
                    <DialogDescription>Manage employees assigned to this task.</DialogDescription>
                </DialogHeader>

                <div className="flex justify-end mb-4">
                    {!isFormOpen && (
                        <Button size="sm" onClick={() => setIsFormOpen(true)}>
                            <Plus className="mr-2 size-4" /> Assign Employee
                        </Button>
                    )}
                </div>
                
                {isFormOpen && (
                    <form onSubmit={handleSave} className="p-4 mb-6 border rounded-lg bg-muted/50">
                        <h3 className="text-lg font-semibold mb-4">Assign New Employee</h3>
                        <div className="grid gap-4">
                            <Select
                                value={formData.employee_id ? String(formData.employee_id) : ""}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: Number(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableEmployees.map(emp => (
                                        <SelectItem key={emp.id} value={String(emp.id)}>
                                            #{emp.id} {emp.last_name} ({emp.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                id="role_on_task"
                                placeholder="Role on task (e.g., Developer)"
                                value={formData.role_on_task || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, role_on_task: e.target.value }))}
                            />
                            <Input
                                id="assigned_hours"
                                type="number"
                                placeholder="Assigned Hours"
                                value={formData.assigned_hours || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, assigned_hours: Number(e.target.value) || undefined }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                )}

                <div className="space-y-2">
                    {assignments.map(assignment => (
                        <div key={assignment.employee_id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                                <p className="font-semibold">#{assignment.employee.id} {assignment.employee.last_name} ({assignment.employee.role})</p>
                                <p className="text-sm text-muted-foreground">{assignment.role_on_task} - {assignment.assigned_hours} hours</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(assignment.employee_id, assignment.task_id)}>
                                    <Trash className="size-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {assignments.length === 0 && !isFormOpen && (
                        <p className="text-center text-muted-foreground py-4">No employees assigned to this task.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const getProjectsColumns = ({ onDelete }: { onDelete: (project: Project) => void; }): ColumnDef<Project>[] => [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project Title" />,
        cell: ({ row }) => <span>{row.original.title}</span>,
    },
    {
        accessorKey: "start_date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" />,
        cell: ({ row }) => new Date(row.original.start_date).toLocaleDateString(),
    },
    {
        accessorKey: "end_date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="End Date" />,
        cell: ({ row }) => row.original.end_date ? new Date(row.original.end_date).toLocaleDateString() : <Badge variant="outline">Ongoing</Badge>,
    },
    {
        id: "tasks",
        header: "Tasks",
        cell: ({ row }) => {
            const project = row.original;
            const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
            const [employees, setEmployees] = useState<Employee[]>([]);
            const [isModalOpen, setIsModalOpen] = useState(false);
            const [isFormOpen, setIsFormOpen] = useState(false);
            const [editingTask, setEditingTask] = useState<Task | null>(null);
            const [selectedTaskForAssignments, setSelectedTaskForAssignments] = useState<Task | null>(null);

            const emptyTask: Omit<Task, 'id' | 'assignments'> = {
                project_id: project.id,
                title: "",
                description: "",
                start_date: new Date().toISOString().split("T")[0],
                end_date: "",
                estimated_hours: 0,
                status: "To Do",
            };

            const [formData, setFormData] = useState<Omit<Task, 'id' | 'assignments'> | Task>(emptyTask);

            useEffect(() => {
                if (isModalOpen && employees.length === 0) {
                    getEmployees().then(setEmployees).catch(err => console.error("Failed to fetch employees:", err));
                }
            }, [isModalOpen, employees.length]);
            
            useEffect(() => {
                if (editingTask) {
                    setFormData(editingTask);
                    setIsFormOpen(true);
                } else {
                    setFormData(emptyTask);
                }
            }, [editingTask, project.id]);

            const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { id, value } = e.target;
                setFormData({ ...formData, [id]: value });
            };

            const handleSaveTask = async (e: React.FormEvent) => {
                e.preventDefault();
                try {
                    if ('id' in formData && formData.id) {
                        const updatedTask = await updateTask(formData.id, formData);
                        setTasks(tasks.map((task) => task.id === formData.id ? updatedTask : task));
                    } else {
                        const newTaskPayload = { ...formData };
                        delete (newTaskPayload as Partial<Task>)['id'];
                        delete (newTaskPayload as Partial<Task>)['assignments'];
                        const newTask = await createTask(newTaskPayload);
                        setTasks([...tasks, newTask]);
                    }
                    setEditingTask(null);
                    setIsFormOpen(false);
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
            
            return (
                <>
                    <Dialog open={isModalOpen} onOpenChange={(open) => {
                        setIsModalOpen(open);
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
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" onClick={() => { setEditingTask(null); automateTaskAssignment(project.id); }}>
                                            <Bot className="mr-2 size-4" /> Automate Task Assignments
                                        </Button>
                                        <Button size="sm" onClick={() => { setEditingTask(null); setIsFormOpen(true); }}>
                                            <Plus className="mr-2 size-4" /> Add New Task
                                        </Button>
                                    </div>
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
                                        <Select
                                            value={formData.status ? String(formData.status) : "To Do"}
                                            onValueChange={(value) =>
                                                setFormData(prev => ({ ...prev, status: value as "To Do" | "In Progress" | "Done" }))
                                            }                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["To Do", "In Progress", "Done"].map(status => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input id="estimated_hours" type="number" placeholder="Estimated Hours" value={formData.estimated_hours ?? ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                                        <Button type="submit">{editingTask ? 'Save Changes' : 'Create Task'}</Button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-4">
                                {tasks.map(task => (
                                    <div key={task.id} className="flex justify-between items-center p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-semibold">{task.title}</p>
                                            <p className="text-sm text-muted-foreground">{task.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setSelectedTaskForAssignments(task)}>
                                                <Users className="size-4" />
                                                <Badge variant="secondary">{task.assignments.length}</Badge>
                                            </Button>
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
                    {selectedTaskForAssignments && (
                        <AssignmentsModal
                            task={selectedTaskForAssignments}
                            employees={employees}
                            isOpen={!!selectedTaskForAssignments}
                            onOpenChange={() => setSelectedTaskForAssignments(null)}
                            onUpdate={() => {
                                setSelectedTaskForAssignments(null);
                                window.location.reload();
                            }}
                        />
                    )}
                </>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "budget_total",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Budget" />,
        cell: ({ row }) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(row.getValue("budget_total"))),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const project = row.original;
            const [isEditModalOpen, setIsEditModalOpen] = useState(false);
            return (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setIsEditModalOpen(true)}>
                        <Pen className="size-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(project)}>
                        <Trash className="size-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                    <ProjectEditModal
                        project={project}
                        isOpen={isEditModalOpen}
                        onOpenChange={setIsEditModalOpen}
                        onProjectUpdate={() => window.location.reload()}
                    />
                </div>
            );
        },
        enableSorting: false,
    },
];