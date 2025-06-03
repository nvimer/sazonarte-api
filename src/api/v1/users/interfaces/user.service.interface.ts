import { User } from "@prisma/client";
import { CreateUserInput, UpdateUserInput } from "../user.validator";

export interface UserServiceInterface {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: string, data: UpdateUserInput): Promise<User>;
}
