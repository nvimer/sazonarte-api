import { User } from "@prisma/client";
import { UpdateUserInput } from "../user.validator";
import { RegisterInput } from "../../auth/auth.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";
import { AutheticatedUser } from "../../../../types/express";

export interface UserServiceInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<User>>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  register(data: RegisterInput): Promise<User>;
  updateUser(id: string, data: UpdateUserInput): Promise<User>;
  findUserWithRolesAndPermissions(id: string): Promise<AutheticatedUser>;
}
