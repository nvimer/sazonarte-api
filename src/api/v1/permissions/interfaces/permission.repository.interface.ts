import { Permission } from "@prisma/client";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "../permission.validator";

export interface PermissionRepositoryInterface {
  findAll(): Promise<Permission[]>;
  findById(id: number): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  create(data: CreatePermissionInput): Promise<Permission>;
  update(id: number, data: UpdatePermissionInput): Promise<Permission>;
  delete(id: number): Promise<Permission>;
}
