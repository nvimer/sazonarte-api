import { Role } from "@prisma/client";
import { CreateRoleInput, UpdateRoleInput } from "../role.validator";

export interface RoleRepositoryInterface {
  findAll(): Promise<Role[]>;
  findById(id: number): Promise<Role | null>;
  // findByName(): Promise<Role | null>;
  create(data: CreateRoleInput): Promise<Role>;
  update(id: number, data: UpdateRoleInput): Promise<Role>;
  // delete(id: number): Promise<Role>;
}
