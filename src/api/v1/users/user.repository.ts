import { User } from "@prisma/client";
import prisma from "../../../database/prisma";
import { CreateUserInput } from "./user.validator";

export interface UserRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
}

class UserRepository implements UserRepositoryInterface {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
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
