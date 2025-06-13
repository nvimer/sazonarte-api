import { CreateRoleInput, UpdateRoleInput } from "./role.validator";
import prisma from "../../../database/prisma";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import { Role } from "@prisma/client";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

class RoleRepository implements RoleRepositoryInterface {
  async findAll(params: PaginationParams): Promise<PaginatedResponse<Role>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.role.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(roles, total, params);
  }

  async findById(id: number): Promise<Role | null> {
    return prisma.role.findUnique({ where: { id } });
  }

  async create(data: CreateRoleInput): Promise<Role> {
    const { permissionIds, ...roleData } = data;

    return await prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          create:
            permissionIds?.map((permissionId) => ({
              permission: { connect: { id: permissionId } },
            })) || [],
        },
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async update(id: number, data: UpdateRoleInput): Promise<Role> {
    return await prisma.role.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Role> {
    return await prisma.role.delete({ where: { id } });
  }
}

export default new RoleRepository();
