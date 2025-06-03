import { z } from "zod";
import { idParamsSchema } from "../../../utils/params.schema";

export const idPermissionSchema = z.object({
  params: idParamsSchema,
});

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string({ message: "Invalid! name is a string" }).max(50),
    description: z.string().max(255),
    updatedAt: z.string().optional(),
  }),
});

export const updatePermissionSchema = z.object({
  params: idParamsSchema,
  body: z
    .object({
      name: z.string().max(50),
      description: z.string().max(50),
    })
    .partial(),
});

export type PermissionIdParam = z.infer<typeof idPermissionSchema>["params"];
export type CreatePermissionInput = z.infer<
  typeof createPermissionSchema
>["body"];
export type UpdatePermissionInput = z.infer<
  typeof updatePermissionSchema
>["body"];
