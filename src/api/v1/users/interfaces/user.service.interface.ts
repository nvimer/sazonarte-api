import { User } from "@prisma/client";
import { CreateUserInput } from "../user.validator";

export interface UserServiceInterface {
  createUser(data: CreateUserInput): Promise<User | undefined>;
}
