import { User } from "@prisma/client";
import prisma from "../../../database/prisma";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";
import { UpdateUserInput } from "./user.validator";
import { RegisterInput } from "../auth/auth.validator";
import { AutheticatedUser } from "../../../types/express";

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
  async create(data: RegisterInput): Promise<User> {
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

  async findUserWithPermissions(id: string): Promise<AutheticatedUser | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }
    return user as AutheticatedUser;
  }
}

export default new UserRepository();
