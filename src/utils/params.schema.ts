import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string(),
});

export type IdParam = z.infer<typeof idParamsSchema>;
