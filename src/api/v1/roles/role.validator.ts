import { RoleName } from "@prisma/client";
import { z } from "zod";
import { idParamsSchema } from "../../../utils/params.schema";

/**
 * Zod enum for role names from Prisma schema
 */
const roleName = z.enum(Object.values(RoleName) as [RoleName, ...RoleName[]]);

/**
 * Validation schema for role ID parameters.
 * Used for routes that require a role ID in the URL parameters.
 */
export const roleIdSchema = z.object({
  params: idParamsSchema,
});

/**
 * Validation schema for creating a new role.
 * Validates all required fields with appropriate constraints.
 */
export const createRoleSchema = z.object({
  body: z.object({
    name: roleName.refine(
      (val) => val && val.length > 0,
      "Role name is required",
    ),
    description: z
      .string({
        required_error: "Role description is required",
        invalid_type_error: "Role description must be a string",
      })
      .min(1, "Role description cannot be empty")
      .max(255, "Role description cannot exceed 255 characters")
      .trim(),
    permissionIds: z
      .array(
        z.number().int().positive("Permission ID must be a positive integer"),
      )
      .min(0, "Permission IDs must be an array of positive integers")
      .optional()
      .default([]),
  }),
});

/**
 * Validation schema for updating an existing role.
 * All fields are optional for partial updates.
 */
export const updateRoleSchema = z.object({
  body: z
    .object({
      name: roleName.optional(),
      description: z
        .string({
          invalid_type_error: "Role description must be a string",
        })
        .min(1, "Role description cannot be empty")
        .max(255, "Role description cannot exceed 255 characters")
        .trim()
        .optional(),
      permissionIds: z
        .array(
          z.number().int().positive("Permission ID must be a positive integer"),
        )
        .min(0, "Permission IDs must be an array of positive integers")
        .optional(),
    })
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

/**
 * Validation schema for search/filter parameters.
 * Used for filtering roles by name or other criteria.
 */
export const roleSearchSchema = z.object({
  query: z.object({
    search: z
      .string()
      .min(1, "Search term must be at least 1 character")
      .max(100, "Search term cannot exceed 100 characters")
      .trim()
      .optional(),
    active: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});

/**
 * Validation schema for bulk operations.
 * Used for bulk create, update, or delete operations.
 */
export const bulkRoleSchema = z.object({
  body: z.object({
    ids: z
      .array(z.number().int().positive())
      .min(1, "At least one role ID must be provided")
      .max(100, "Cannot process more than 100 roles at once"),
  }),
});

/**
 * Validation schema for assigning permissions to a role.
 *
 * This schema validates the request body when assigning permissions
 * to a specific role. The operation replaces all existing permissions
 * with the new set provided.
 *
 * Validation Rules:
 * - permissionIds: Must be an array of positive integers
 * - At least one permission ID is required
 */
export const assignPermissionsSchema = z.object({
  body: z.object({
    permissionIds: z
      .array(z.number().int().positive())
      .min(1, "At least one permission ID is required"),
  }),
});

/**
 * Validation schema for removing permissions from a role.
 *
 * This schema validates the request body when removing specific
 * permissions from a role. The operation only removes the specified
 * permissions, leaving other permissions intact.
 *
 * Validation Rules:
 * - permissionIds: Must be an array of positive integers
 * - At least one permission ID is required
 */
export const removePermissionsSchema = z.object({
  body: z.object({
    permissionIds: z
      .array(z.number().int().positive())
      .min(1, "At least one permission ID is required"),
  }),
});

export type RoleIdParam = z.infer<typeof roleIdSchema>["params"];
export type CreateRoleInput = z.infer<typeof createRoleSchema>["body"];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>["body"];
export type RoleSearchParams = z.infer<typeof roleSearchSchema>["query"];
export type BulkRoleInput = z.infer<typeof bulkRoleSchema>["body"];
export type AssignPermissionsInput = z.infer<
  typeof assignPermissionsSchema
>["body"];
export type RemovePermissionsInput = z.infer<
  typeof removePermissionsSchema
>["body"];
