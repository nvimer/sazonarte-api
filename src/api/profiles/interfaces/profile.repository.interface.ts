import { User } from "@prisma/client";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { UpdateProfileInput } from "../profile.validator";
import { UserWithProfile } from "../../../types/prisma.types";

export interface ProfileRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<User>>;
  findById(id: string): Promise<UserWithProfile | null>;
  update(id: string, data: UpdateProfileInput): Promise<UserWithProfile>;
}
