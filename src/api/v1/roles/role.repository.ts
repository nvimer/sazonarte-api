import { CreateRoleInput, UpdateRoleInput } from "./role.validator";
import prisma from "../../../database/prisma";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";

class RoleRepository implements RoleRepositoryInterface {
  async findAll() {
    return await prisma.role.findMany();
  }

  async findById(id: number) {
    return prisma.role.findUnique({ where: { id } });
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

  async update(id: number, data: UpdateRoleInput) {
    return await prisma.role.update({ where: { id }, data });
  }

  async delete(id: number) {
    return await prisma.role.delete({ where: { id } });
  }
}

export default new RoleRepository();
