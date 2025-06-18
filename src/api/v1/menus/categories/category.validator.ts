import { z } from "zod";
import { idParamsSchema } from "../../../../utils/params.schema";

export const categoryIdSchema = z.object({
  params: idParamsSchema,
});

export const createMenuCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3),
    description: z.string(),
    order: z.coerce.number(),
  }),
});

export type CreateMenuCategoryInput = z.infer<
  typeof createMenuCategorySchema
>["body"];
