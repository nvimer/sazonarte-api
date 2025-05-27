import { Role } from "@prisma/client";
import { CreateRoleInput } from "./role.validator";
import roleRepository, { RoleRepositoryInterface } from "./role.repository";

export interface RoleServiceInterface {
  createRole(data: CreateRoleInput): Promise<Role>;
}

class RoleService implements RoleServiceInterface {
  constructor(private roleRepository: RoleRepositoryInterface) {}

  async createRole(data: CreateRoleInput): Promise<Role> {
    return await this.roleRepository.create(data);
  }
}

export default new RoleService(roleRepository);
