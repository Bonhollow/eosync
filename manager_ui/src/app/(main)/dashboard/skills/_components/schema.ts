import z from "zod";

export const recentLeadSchema = z.object({
  id: z.number(),
  name: z.string(),
});
