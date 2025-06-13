import { User } from "@prisma/client";
import { UpdateUserInput } from "../user.validator";
import { RegisterInput } from "../../auth/auth.validator";
import { AutheticatedUser } from "../../../../types/express";
import { PaginationParams, PaginatedResponse } from "../../../../interfaces/pagination.interfaces";

export interface UserRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<User>>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: RegisterInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  findUserWithPermissions(id: string): Promise<AutheticatedUser | null>;
}
