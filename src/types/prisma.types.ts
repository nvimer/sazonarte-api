import { Prisma, User } from "@prisma/client";

export type UserWithProfile = Prisma.UserGetPayload<{
  include: { profile: true };
}>;
