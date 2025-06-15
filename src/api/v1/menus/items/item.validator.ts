import { z } from "zod";

export const createItemSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string(),
    categoryId: z.coerce.number(),
    price: z.coerce.number(),
    isExtra: z.boolean(),
    isAvailable: z.boolean(),
    imageUrl: z.string(),
  }),
});

export type CreateItemInput = z.infer<typeof createItemSchema>["body"];
