import { Permission, PrismaClient, Prisma } from "@prisma/client";
import { PermissionRepositoryInterface } from "./interfaces/permission.repository.interface";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import prisma from "../../../database/prisma";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

class PermissionRepository implements PermissionRepositoryInterface {
  async findAll(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Permission>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.permission.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(permissions, total, params);
  }

  async findById(id: number): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { id },
    });
  }

  async create(data: CreatePermissionInput): Promise<Permission> {
    return prisma.permission.create({
      data,
    });
  }

  async update(id: number, data: UpdatePermissionInput): Promise<Permission> {
    return prisma.permission.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Permission> {
    return prisma.permission.delete({
      where: { id },
    });
  }
}

export default new PermissionRepository();
