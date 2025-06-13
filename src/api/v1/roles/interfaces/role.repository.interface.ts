import { Role } from "@prisma/client";
import { CreateRoleInput, UpdateRoleInput } from "../role.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface RoleRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<Role>>;
  findById(id: number): Promise<Role | null>;
  create(data: CreateRoleInput): Promise<Role>;
  update(id: number, data: UpdateRoleInput): Promise<Role>;
  delete(id: number): Promise<Role>;
}
