import prisma from "../../../database/prisma";
import { Permission } from "@prisma/client";
import { CreatePermissionInput } from "./permission.validator";

export interface PermissionRepositoryInterface {
  findPermissionByName(name: string): Promise<Permission | null>;
  createPermission(data: CreatePermissionInput): Promise<Permission>;
}
class PermissionRepository implements PermissionRepositoryInterface {
  async findPermissionByName(name: string) {
    return await prisma.permission.findUnique({ where: { name } });
  }
  async createPermission(data: CreatePermissionInput) {
    return await prisma.permission.create({ data });
  }
}

export default new PermissionRepository();
