import { Permission } from "@prisma/client";
import permissionRepository, {
  PermissionRepositoryInterface,
} from "./permission.repository";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.validator";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { logger } from "../../../config/logger";

export interface PermissionServiceInterface {
  createPermission(data: CreatePermissionInput): Promise<Permission | null>;
  updatePermission(
    id: number,
    data: UpdatePermissionInput,
  ): Promise<Permission>;
  deletePermission(id: number): Promise<Permission>;
}

class PermissionService implements PermissionServiceInterface {
  constructor(private permissionRepository: PermissionRepositoryInterface) {}

  async createPermission(data: CreatePermissionInput) {
    const permission = await this.permissionRepository.findByName(data.name);

    if (permission)
      throw new CustomError(
        "Permission name exists!",
        HttpStatus.CONFLICT,
        "NAME_CONFLIC|",
      );
    return await this.permissionRepository.create(data);
  }

  async updatePermission(id: number, data: UpdatePermissionInput) {
    const permission = await this.permissionRepository.findById(id);
    logger.info("AQUI");
    if (!permission)
      throw new CustomError(
        "Permission not found, please verify!",
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return await this.permissionRepository.update(id, data);
  }

  async deletePermission(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission)
      throw new CustomError(
        "Permission not found, please verify!",
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return await this.permissionRepository.delete(id);
  }
}

export default new PermissionService(permissionRepository);
