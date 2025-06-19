import { Permission } from "@prisma/client";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionSearchParams,
  BulkPermissionInput,
} from "../permission.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface PermissionServiceInterface {
  findAllPermissions(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Permission>>;
  findPermissionById(id: number): Promise<Permission>;
  createPermission(data: CreatePermissionInput): Promise<Permission>;
  updatePermission(
    id: number,
    data: UpdatePermissionInput,
  ): Promise<Permission>;
  deletePermission(id: number): Promise<Permission>;
  bulkDeletePermissions(data: BulkPermissionInput): Promise<number>;
  searchPermissions(
    params: PaginationParams & PermissionSearchParams,
  ): Promise<PaginatedResponse<Permission>>;
}
