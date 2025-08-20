import { z } from "zod";

export const taskStatusEnum = z.enum(["To Do", "In Progress", "Done"]);

export const employeeSchema = z.object({
  id: z.number(),
  last_name: z.string(),
  role: z.string().email(),
});

export const assignmentSchema = z.object({
  employee_id: z.number(),
  task_id: z.number(),
  assigned_hours: z.coerce.number().optional().nullable(),
  role_on_task: z.string().optional().nullable(),
  employee: employeeSchema,
});

export const taskSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional().nullable(),
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().optional().nullable(),
  estimated_hours: z.coerce.number().optional().nullable(),
  status: taskStatusEnum.optional().nullable().default("To Do"),
  assignments: z.array(assignmentSchema).optional().default([]),
});

export const projectSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().nullable(),
  budget_total: z.coerce.number().min(0, "Budget must be a positive number"),
  tasks: z.array(taskSchema).optional().default([]),
});

export const newProjectPayloadSchema = projectSchema
  .omit({ id: true, tasks: true })
  .extend({
    tasks: z.array(taskSchema.omit({ id: true, project_id: true })).optional(),
  });

export const newTaskPayloadSchema = taskSchema.omit({
  id: true,
  assignments: true,
});

export const newAssignmentPayloadSchema = assignmentSchema.omit({
  employee: true,
});

export type Project = z.infer<typeof projectSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;

export type NewProjectPayload = z.infer<typeof newProjectPayloadSchema>;
export type NewTaskPayload = z.infer<typeof newTaskPayloadSchema>;
export type NewAssignmentPayload = z.infer<typeof newAssignmentPayloadSchema>;
