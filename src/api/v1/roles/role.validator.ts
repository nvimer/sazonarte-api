import { RoleName } from "@prisma/client";
import { z } from "zod";

const roleName = z.enum(Object.values(RoleName) as [RoleName, ...RoleName[]]);

export const createRoleSchema = z.object({
  name: roleName,
  description: z.string().max(255),
  permissionIds: z
    .array(z.number().int().positive())
    .min(
      0,
      "Permission ID's must be an array of positive integers, even if empty",
    )
    .optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
