import { Role } from "@prisma/client";
import { CreateRoleInput } from "../role.validator";

export interface RoleServiceInterface {
  findAllRoles(): Promise<Role[]>;
  createRole(data: CreateRoleInput): Promise<Role>;
}
