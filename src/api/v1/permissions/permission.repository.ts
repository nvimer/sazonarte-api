import prisma from "../../../database/prisma";
import { PermissionRepositoryInterface } from "./interfaces/permission.repository.interface";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.validator";

class PermissionRepository implements PermissionRepositoryInterface {
  async findAll() {
    return await prisma.permission.findMany();
  }

  async findById(id: number) {
    return prisma.permission.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return prisma.permission.findUnique({ where: { name } });
  }

  async create(data: CreatePermissionInput) {
    return prisma.permission.create({ data });
  }

  async update(id: number, data: UpdatePermissionInput) {
    return prisma.permission.update({
      where: { id },
      data: data,
    });
  }

  async delete(id: number) {
    return prisma.permission.delete({ where: { id } });
  }
}

export default new PermissionRepository();
