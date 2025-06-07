import { User } from "@prisma/client";
import { UpdateUserInput } from "../user.validator";
import { RegisterInput } from "../../auth/auth.validator";

export interface UserServiceInterface {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  register(data: RegisterInput): Promise<User>;
  updateUser(id: string, data: UpdateUserInput): Promise<User>;
  findUserWithRolesAndPermissions(id: string): Promise<User>;
}
