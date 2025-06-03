import prisma from "../../../database/prisma";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";
import { CreateUserInput } from "./user.validator";

class UserRepository implements UserRepositoryInterface {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserInput) {
    const { roleIds, ...userData } = data;

    return await prisma.user.create({
      data: {
        ...userData,
        roles: {
          create:
            roleIds.map((roleId) => ({
              role: { connect: { id: roleId } },
            })) || [],
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }
}

export default new UserRepository();
