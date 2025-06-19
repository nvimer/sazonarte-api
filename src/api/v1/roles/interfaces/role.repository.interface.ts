import { Role } from "@prisma/client";
import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleSearchParams,
} from "../role.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface RoleRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<Role>>;
  findById(id: number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(data: CreateRoleInput): Promise<Role>;
  update(id: number, data: UpdateRoleInput): Promise<Role>;
  delete(id: number): Promise<Role>;
  bulkDelete(ids: number[]): Promise<number>;
  search(
    params: PaginationParams & RoleSearchParams,
  ): Promise<PaginatedResponse<Role>>;
}
