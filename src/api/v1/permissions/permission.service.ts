import { Permission } from "@prisma/client";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.validator";
import permissionRepository from "./permission.repository";
import { PermissionServiceInterface } from "./interfaces/permission.service.interface";
import { PermissionRepositoryInterface } from "./interfaces/permission.repository.interface";

import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";

class PermissionService implements PermissionServiceInterface {
  constructor(private permissionRepository: PermissionRepositoryInterface) {}

  private async findPermissionByIdOrFail(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new CustomError(
        `Permission with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    }
    return permission;
  }

  async findAllPermissions() {
    return this.permissionRepository.findAll();
  }

  async findPermissionById(id: number) {
    return this.findPermissionByIdOrFail(id);
  }

  async createPermission(data: CreatePermissionInput) {
    const permission = await this.permissionRepository.findByName(data.name);

    if (permission)
      throw new CustomError(
        `Permission name ${permission.name} exists. Try again`,
        HttpStatus.CONFLICT,
        "NAME_CONFLICT",
      );
    return await this.permissionRepository.create(data);
  }

  async updatePermission(id: number, data: UpdatePermissionInput) {
    await this.findPermissionByIdOrFail(id);
    return await this.permissionRepository.update(id, data);
  }

  async deletePermission(id: number) {
    await this.findPermissionByIdOrFail(id);
    return await this.permissionRepository.delete(id);
  }
}

export default new PermissionService(permissionRepository);
