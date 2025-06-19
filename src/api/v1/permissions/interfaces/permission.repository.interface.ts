import { Permission } from "@prisma/client";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionSearchParams,
} from "../permission.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface PermissionRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<Permission>>;
  findById(id: number): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  create(data: CreatePermissionInput): Promise<Permission>;
  update(id: number, data: UpdatePermissionInput): Promise<Permission>;
  delete(id: number): Promise<Permission>;
  bulkDelete(ids: number[]): Promise<number>;
  search(
    params: PaginationParams & PermissionSearchParams,
  ): Promise<PaginatedResponse<Permission>>;
}
