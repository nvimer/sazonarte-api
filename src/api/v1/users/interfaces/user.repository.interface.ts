import { User } from "@prisma/client";
import { CreateUserInput, UpdateUserInput } from "../user.validator";

export interface UserRepositoryInterface {
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(d: string, data: UpdateUserInput): Promise<User>;
}
