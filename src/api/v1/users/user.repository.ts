import { User } from "@prisma/client";
import prisma from "../../../database/prisma";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";
import { UpdateUserInput } from "./user.validator";
import { RegisterInput } from "../auth/auth.validator";
import { AutheticatedUser } from "../../../types/express";
import { PaginationParams, PaginatedResponse } from "../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

class UserRepository implements UserRepositoryInterface {
  async findAll(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(users, total, params);
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
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
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async findUserWithPermissions(id: string): Promise<AutheticatedUser | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

export default new UserRepository();
