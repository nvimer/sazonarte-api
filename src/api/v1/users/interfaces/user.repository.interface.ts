import { User } from "@prisma/client";
import { CreateUserInput } from "../user.validator";

export interface UserRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
}
