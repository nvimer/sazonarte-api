import { Permission } from "@prisma/client";
import { PermissionServiceInterface } from "./interfaces/permission.service.interface";
import { PermissionRepositoryInterface } from "./interfaces/permission.repository.interface";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import permissionRepository from "./permission.repository";

class PermissionService implements PermissionServiceInterface {
  constructor(
    private readonly permissionRepository: PermissionRepositoryInterface,
  ) {}

  async findAllPermissions(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Permission>> {
    return this.permissionRepository.findAll(params);
  }

  async findPermissionById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new Error("Permission not found");
    }
    return permission;
  }

  async createPermission(data: CreatePermissionInput): Promise<Permission> {
    return this.permissionRepository.create(data);
  }

  async updatePermission(
    id: number,
    data: UpdatePermissionInput,
  ): Promise<Permission> {
    await this.findPermissionById(id);
    return this.permissionRepository.update(id, data);
  }

  async deletePermission(id: number): Promise<Permission> {
    await this.findPermissionById(id);
    return this.permissionRepository.delete(id);
  }
}

export default new PermissionService(permissionRepository);
