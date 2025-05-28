import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z.string({ message: "Invalid! name is a string." }).max(50),
  description: z.string().max(255),
  updatedAt: z.string().date().optional(),
});

export const updatePermissionSchema = z
  .object({
    name: z.string().max(50),
    description: z.string().max(50),
  })
  .partial();

export const permissionIdSchema = z.object({
  id: z.coerce.number().int("Invalid permission ID format"),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type PermissionIdParam = z.infer<typeof permissionIdSchema>;
