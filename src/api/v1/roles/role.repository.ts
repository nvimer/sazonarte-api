import { Role } from "@prisma/client";
import { CreateRoleInput } from "./role.validator";
import prisma from "../../../database/prisma";

export interface RoleRepositoryInterface {
  create(data: CreateRoleInput): Promise<Role>;
}

class RoleRepository implements RoleRepositoryInterface {
  async create(data: CreateRoleInput): Promise<Role> {
    return await prisma.role.create({ data });
  }
}

export default new RoleRepository();
