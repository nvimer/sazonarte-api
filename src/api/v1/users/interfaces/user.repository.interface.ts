import { User } from "@prisma/client";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";
import { UpdateUserInput } from "../user.validator";
import { RegisterInput } from "../../auth/auth.validator";
import { AuthenticatedUser } from "../../../../types/express";

export interface UserRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<User>>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: RegisterInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  findUserWithPermissions(id: string): Promise<AuthenticatedUser | null>;
}

