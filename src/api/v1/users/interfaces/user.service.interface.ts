import { User } from "@prisma/client";
import { CreateUserInput } from "../user.validator";

export interface UserServiceInterface {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
}
