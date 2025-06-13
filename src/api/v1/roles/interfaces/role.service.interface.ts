import { Role } from "@prisma/client";
import { CreateRoleInput, UpdateRoleInput } from "../role.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface RoleServiceInterface {
  findAllRoles(params: PaginationParams): Promise<PaginatedResponse<Role>>;
  findRoleById(id: number): Promise<Role | null>;
  createRole(data: CreateRoleInput): Promise<Role>;
  updateRole(id: number, data: UpdateRoleInput): Promise<Role>;
  deleteRole(id: number): Promise<Role>;
}
