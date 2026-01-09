import { User } from "@prisma/client";
import { LoginInput } from "../auth.validator";

/**
 * Auth Service Interface
 */
export interface AuthServiceInterface {
  login(data: LoginInput): Promise<User>;
}
