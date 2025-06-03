import { Role } from "@prisma/client";
import { CreateRoleInput, UpdateRoleInput } from "../role.validator";

export interface RoleServiceInterface {
  findAllRoles(): Promise<Role[]>;
  findRoleById(id: number): Promise<Role | null>;
  createRole(data: CreateRoleInput): Promise<Role>;
  updateRole(id: number, data: UpdateRoleInput): Promise<Role>;
  deleteRole(id: number): Promise<Role>;
}
