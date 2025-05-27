import { RoleName } from "@prisma/client";
import { z } from "zod";

const roleName = z.enum(Object.values(RoleName) as [RoleName, ...RoleName[]]);

export const createRoleSchema = z.object({
  name: roleName,
  description: z.string().max(255),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
