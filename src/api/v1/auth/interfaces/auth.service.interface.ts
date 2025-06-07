import { User } from "@prisma/client";
import { LoginInput } from "../auth.validator";

export interface AuthServiceInterface {
  login(data: LoginInput): Promise<User>;
}
