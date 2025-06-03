import { Permission } from "@prisma/client";
import prisma from "../../../database/prisma";
import { PermissionRepositoryInterface } from "./interfaces/permission.repository.interface";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.validator";

class PermissionRepository implements PermissionRepositoryInterface {
  async findAll(): Promise<Permission[]> {
    return await prisma.permission.findMany();
  }

  async findById(id: number): Promise<Permission | null> {
    return prisma.permission.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Permission | null> {
    return prisma.permission.findUnique({ where: { name } });
  }

  async create(data: CreatePermissionInput): Promise<Permission> {
    return prisma.permission.create({ data });
  }

  async update(id: number, data: UpdatePermissionInput): Promise<Permission> {
    return prisma.permission.update({
      where: { id },
      data: data,
    });
  }

  delete(id: number): Promise<Permission> {
    return prisma.permission.delete({ where: { id } });
  }
}

export default new PermissionRepository();
