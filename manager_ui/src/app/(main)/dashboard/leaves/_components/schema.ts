import { z } from "zod";

export const employeeSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
});

export const leaveTypeEnum = z.enum(["Vacation", "Sick", "Other"]);

export const leaveSchema = z.object({
  id: z.number(),
  type: leaveTypeEnum,
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  approved: z.boolean(),
  reason: z.string().nullish(),
  employee: employeeSchema,
});

export const leaveCreateSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee is required." })
    .min(1, "Employee is required."),
  type: leaveTypeEnum,
  approved: z.boolean().optional(),
  start_date: z
    .string({ required_error: "Start date is required." })
    .min(1, "Start date cannot be empty."),
  end_date: z
    .string({ required_error: "End date is required." })
    .min(1, "End date cannot be empty."),
  reason: z.string().nullish(),
});

export const leaveUpdateSchema = z.object({
  type: leaveTypeEnum,
  start_date: z.string(),
  end_date: z.string(),
  approved: z.boolean().optional(),
  reason: z.string().nullish(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type Leave = z.infer<typeof leaveSchema>;
export type LeaveCreate = z.infer<typeof leaveCreateSchema>;
export type LeaveUpdate = z.infer<typeof leaveUpdateSchema>;
