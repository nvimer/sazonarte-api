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

export const updateMenuCategorySchema = z.object({
  body: z
    .object({
      name: z.string().min(3),
      description: z.string(),
      order: z.coerce.number(),
    })
    .partial(),
});

export type MenuCategoryIdParams = z.infer<typeof categoryIdSchema>["params"];
export type CreateMenuCategoryInput = z.infer<
  typeof createMenuCategorySchema
>["body"];
export type UpdateMenuCategoryInput = z.infer<
  typeof updateMenuCategorySchema
>["body"];
