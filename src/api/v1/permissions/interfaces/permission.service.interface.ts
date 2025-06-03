import { Permission } from "@prisma/client";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "../permission.validator";

export interface PermissionServiceInterface {
  findAllPermissions(): Promise<Permission[]>;
  findPermissionById(id: number): Promise<Permission>;
  createPermission(data: CreatePermissionInput): Promise<Permission>;
  updatePermission(
    id: number,
    data: UpdatePermissionInput,
  ): Promise<Permission>;
  deletePermission(id: number): Promise<Permission>;
}
