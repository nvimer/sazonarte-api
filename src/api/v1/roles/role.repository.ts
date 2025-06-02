import { CreateRoleInput } from "./role.validator";
import prisma from "../../../database/prisma";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";

class RoleRepository implements RoleRepositoryInterface {
  async findAll() {
    return await prisma.role.findMany();
  }

  async create(data: CreateRoleInput) {
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
