import { Permission } from "@prisma/client";
import permissionRepository, {
  PermissionRepositoryInterface,
} from "./permission.repository";
import { CreatePermissionInput } from "./permission.validator";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";

export interface PermissionServiceInterface {
  createPermission(data: CreatePermissionInput): Promise<Permission | null>;
}

class PermissionService implements PermissionServiceInterface {
  constructor(private permissionRepository: PermissionRepositoryInterface) {}

  async createPermission(data: CreatePermissionInput) {
    console.log(`data in service: ${data}`);
    const permission = await this.permissionRepository.findPermissionByName(
      data.name,
    );

    if (permission)
      throw new CustomError(
        "Permission name exists!",
        HttpStatus.CONFLICT,
        "NAME_CONFLIC|",
      );
    return await this.permissionRepository.createPermission(data);
  }
}

export default new PermissionService(permissionRepository);
