import { z } from "zod";
import { idParamsSchema } from "../../../utils/params.schema";

/**
 * Schema for permission ID parameter validation
 * Validates that the ID is a positive integer
 */
export const permissionIdSchema = z.object({
  params: idParamsSchema,
});

/**
 * Schema for creating a new permission
 * Validates required fields and data types
 */
export const createPermissionSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Permission name is required" })
      .min(2, "Permission name must be at least 2 characters")
      .max(50, "Permission name must not exceed 50 characters")
      .trim()
      .refine((val) => val && val.length > 0, "Permission name is required"),
    description: z
      .string({ message: "Permission description is required" })
      .min(5, "Permission description must be at least 5 characters")
      .max(255, "Permission description must not exceed 255 characters")
      .trim()
      .refine(
        (val) => val && val.length > 0,
        "Permission description is required",
      ),
  }),
});

/**
 * Schema for updating an existing permission
 * All fields are optional but at least one must be provided
 */
export const updatePermissionSchema = z.object({
  params: idParamsSchema,
  body: z
    .object({
      name: z
        .string({ message: "Permission name must be a string" })
        .min(2, "Permission name must be at least 2 characters")
        .max(50, "Permission name must not exceed 50 characters")
        .trim()
        .optional(),
      description: z
        .string({ message: "Permission description must be a string" })
        .min(5, "Permission description must be at least 5 characters")
        .max(255, "Permission description must not exceed 255 characters")
        .trim()
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

/**
 * Schema for searching permissions
 * Validates search parameters and filters
 */
export const permissionSearchSchema = z.object({
  query: z.object({
    search: z
      .string()
      .min(1, "Search term must be at least 1 character")
      .max(100, "Search term must not exceed 100 characters")
      .optional(),
    active: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});

/**
 * Schema for bulk delete operations
 * Validates array of permission IDs
 */
export const bulkPermissionSchema = z.object({
  body: z.object({
    ids: z
      .array(
        z.number().int().positive("Permission ID must be a positive integer"),
      )
      .min(1, "At least one permission ID must be provided")
      .max(100, "Maximum 100 permissions can be deleted at once"),
  }),
});

// Type definitions for TypeScript
export type PermissionIdParam = z.infer<typeof permissionIdSchema>["params"];
export type CreatePermissionInput = z.infer<
  typeof createPermissionSchema
>["body"];
export type UpdatePermissionInput = z.infer<
  typeof updatePermissionSchema
>["body"];
export type PermissionSearchParams = z.infer<
  typeof permissionSearchSchema
>["query"];
export type BulkPermissionInput = z.infer<typeof bulkPermissionSchema>["body"];
