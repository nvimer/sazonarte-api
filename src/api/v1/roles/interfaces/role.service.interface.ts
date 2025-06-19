import { Role } from "@prisma/client";
import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleSearchParams,
  BulkRoleInput,
} from "../role.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface RoleServiceInterface {
  findAllRoles(params: PaginationParams): Promise<PaginatedResponse<Role>>;
  findRoleById(id: number): Promise<Role>;
  createRole(data: CreateRoleInput): Promise<Role>;
  updateRole(id: number, data: UpdateRoleInput): Promise<Role>;
  deleteRole(id: number): Promise<Role>;
  bulkDeleteRoles(data: BulkRoleInput): Promise<number>;
  searchRoles(
    params: PaginationParams & RoleSearchParams,
  ): Promise<PaginatedResponse<Role>>;
}
