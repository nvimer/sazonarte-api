import prisma from "../../../database/prisma";
import { Permission } from "@prisma/client";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.validator";

export interface PermissionRepositoryInterface {
  findById(id: number): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  create(data: CreatePermissionInput): Promise<Permission>;
  update(id: number, data: UpdatePermissionInput): Promise<Permission>;
  delete(id: number): Promise<Permission>;
}
class PermissionRepository implements PermissionRepositoryInterface {
  async findById(id: number) {
    return await prisma.permission.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return await prisma.permission.findUnique({ where: { name } });
  }

  async create(data: CreatePermissionInput) {
    return await prisma.permission.create({ data });
  }

  async update(id: number, data: UpdatePermissionInput) {
    return await prisma.permission.update({
      where: { id },
      data: data,
    });
  }

  async delete(id: number) {
    return await prisma.permission.delete({ where: { id } });
  }
}

export default new PermissionRepository();
