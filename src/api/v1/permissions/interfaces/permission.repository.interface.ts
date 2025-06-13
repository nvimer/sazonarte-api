import { Permission } from "@prisma/client";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "../permission.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface PermissionRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<Permission>>;
  findById(id: number): Promise<Permission | null>;
  create(data: CreatePermissionInput): Promise<Permission>;
  update(id: number, data: UpdatePermissionInput): Promise<Permission>;
  delete(id: number): Promise<Permission>;
}
