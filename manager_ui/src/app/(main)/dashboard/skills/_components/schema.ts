import z from "zod";

export const skillSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type Skill = z.infer<typeof skillSchema>;
