import { RoleServiceInterface } from "./interfaces/role.service.interface";
import { CreateRoleInput, UpdateRoleInput } from "./role.validator";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import roleRepository from "./role.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { Role } from "@prisma/client";

class RoleService implements RoleServiceInterface {
  constructor(private roleRepository: RoleRepositoryInterface) {}

  private async findRoleByIdOrFail(id: number): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role)
      throw new CustomError(
        `Role with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return role;
  }

  async findAllRoles() {
    return await this.roleRepository.findAll();
  }

  async findRoleById(id: number) {
    return this.findRoleByIdOrFail(id);
  }

  async createRole(data: CreateRoleInput) {
    return await this.roleRepository.create(data);
  }

  async updateRole(id: number, data: UpdateRoleInput) {
    await this.findRoleByIdOrFail(id);
    return await this.roleRepository.update(id, data);
  }
}

export default new RoleService(roleRepository);
