import { Role } from "@prisma/client";
import { CreateRoleInput } from "./role.validator";
import prisma from "../../../database/prisma";

export interface RoleRepositoryInterface {
  create(data: CreateRoleInput): Promise<Role>;
}

class RoleRepository implements RoleRepositoryInterface {
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
}

export default new RoleRepository();
