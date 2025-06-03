import { User } from "@prisma/client";
import prisma from "../../../database/prisma";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";
import { CreateUserInput, UpdateUserInput } from "./user.validator";

class UserRepository implements UserRepositoryInterface {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  // This operation create a user with data sended for user. Additionally create a relation between user-roles and user-profile.
  async create(data: CreateUserInput): Promise<User> {
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
        profile: {
          create: {},
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }
}

export default new UserRepository();
