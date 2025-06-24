import { User } from "@prisma/client";
import { UpdateUserInput } from "../../users/user.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface ProfileRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<User>>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: UpdateUserInput): Promise<User>;
}
