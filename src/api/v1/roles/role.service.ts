import { RoleServiceInterface } from "./interfaces/role.service.interface";
import { CreateRoleInput, UpdateRoleInput } from "./role.validator";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import roleRepository from "./role.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { Role } from "@prisma/client";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";

class RoleService implements RoleServiceInterface {
  constructor(private roleRepository: RoleRepositoryInterface) {}

  private async findRoleByIdOrFail(id: number): Promise<Role | null> {
    const role = await this.roleRepository.findById(id);
    if (!role)
      throw new CustomError(
        `Role with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return role;
  }

  async findAllRoles(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Role>> {
    return await this.roleRepository.findAll(params);
  }

  async findRoleById(id: number): Promise<Role | null> {
    return this.findRoleByIdOrFail(id);
  }

  async createRole(data: CreateRoleInput): Promise<Role> {
    return await this.roleRepository.create(data);
  }

  async updateRole(id: number, data: UpdateRoleInput): Promise<Role> {
    await this.findRoleByIdOrFail(id);
    return await this.roleRepository.update(id, data);
  }

  async deleteRole(id: number): Promise<Role> {
    await this.findRoleByIdOrFail(id);
    return await this.roleRepository.delete(id);
  }
}

export default new RoleService(roleRepository);
