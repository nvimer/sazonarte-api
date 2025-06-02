import { RoleName } from "@prisma/client";
import { z } from "zod";
import { idParamsSchema } from "../../../utils/params.schema";

const roleName = z.enum(Object.values(RoleName) as [RoleName, ...RoleName[]]);

export const roleIdSchema = z.object({
  params: idParamsSchema,
});

export const createRoleSchema = z.object({
  body: z.object({
    name: roleName,
    description: z.string().max(255),
    permissionIds: z
      .array(z.number().int().positive())
      .min(0, "Permission ID's must be an array of positive integers")
      .optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: idParamsSchema,
  body: z
    .object({
      name: roleName,
      description: z.string().max(255),
      permissionIds: z
        .array(z.number().int().positive())
        .min(0, "Permission ID's must be an array of positive integers"),
    })
    .partial(),
});

export type RoleIdParam = z.infer<typeof roleIdSchema>["params"];
export type CreateRoleInput = z.infer<typeof createRoleSchema>["body"];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>["body"];
