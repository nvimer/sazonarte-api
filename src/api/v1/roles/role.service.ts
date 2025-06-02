import { RoleServiceInterface } from "./interfaces/role.service.interface";
import { CreateRoleInput } from "./role.validator";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import roleRepository from "./role.repository";

class RoleService implements RoleServiceInterface {
  constructor(private roleRepository: RoleRepositoryInterface) {}

  async findAllRoles() {
    return await this.roleRepository.findAll();
  }

  async createRole(data: CreateRoleInput) {
    return await this.roleRepository.create(data);
  }
}

export default new RoleService(roleRepository);
