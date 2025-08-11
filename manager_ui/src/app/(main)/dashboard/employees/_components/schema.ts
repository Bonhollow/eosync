import { z } from "zod";

const emptyStringToNull = z.string().transform((val) => val === "" ? null : val);

const employeeBaseSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  birth_date: z.string(),
  email: z.string().email(),
  phone: z.string(),
  hire_date: z.string(),
  role: z.string(),
  department: z.string(),
  salary: z.number(),
  skills: z.array(z.object({
    id: z.string().or(z.number()),
    name: z.string(),
  })),
});

export const employeeSchema = z.object({
  id: z.number(),
  first_name: emptyStringToNull.nullable().optional(),
  last_name: z.string(),
  birth_date: emptyStringToNull.nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: emptyStringToNull.nullable().optional(),
  hire_date: emptyStringToNull.nullable().optional(),
  role: z.string(),
  department: emptyStringToNull.nullable().optional(),
  salary: z.number().nullable().optional(),
  skills: z.array(z.object({
    id: z.string().or(z.number()),
    name: z.string(),
  })).optional(),
});

export const employeeCreateSchema = z.object({
  first_name: emptyStringToNull.nullable().optional(),
  last_name: z.string(),
  birth_date: emptyStringToNull.nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: emptyStringToNull.nullable().optional(),
  hire_date: emptyStringToNull.nullable().optional(),
  role: z.string(),
  department: emptyStringToNull.nullable().optional(),
  salary: z.number().nullable().optional().or(z.literal(0)),
  skills: z.array(z.object({
    id: z.string().or(z.number()),
    name: z.string(),
  })).optional(),
});

export const employeeUpdateSchema = z.object({
  first_name: emptyStringToNull.nullable().optional(),
  last_name: emptyStringToNull.nullable().optional(),
  birth_date: emptyStringToNull.nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: emptyStringToNull.nullable().optional(),
  hire_date: emptyStringToNull.nullable().optional(),
  role: emptyStringToNull.nullable().optional(),
  department: emptyStringToNull.nullable().optional(),
  salary: z.number().nullable().optional(),
  skills: z.array(z.object({
    id: z.string().or(z.number()),
    name: z.string(),
  })).optional(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeCreate = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;

export const cleanEmployeeData = (data: Partial<EmployeeCreate>): EmployeeCreate => {
  return {
    first_name: data.first_name === "" ? null : data.first_name || null,
    last_name: data.last_name || "",
    birth_date: data.birth_date === "" ? null : data.birth_date || null,
    email: data.email === "" ? null : data.email || null,
    phone: data.phone === "" ? null : data.phone || null,
    hire_date: data.hire_date === "" ? null : data.hire_date || null,
    role: data.role || "",
    department: data.department === "" ? null : data.department || null,
    salary: data.salary === 0 || data.salary === 0 ? null : data.salary || null,
    skills: data.skills || [],
  } as EmployeeCreate;
};