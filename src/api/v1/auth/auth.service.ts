import { User } from "@prisma/client";
import { LoginInput } from "./auth.validator";
import { AuthServiceInterface } from "./interfaces/auth.service.interface";
import { UserServiceInterface } from "../users/interfaces/user.service.interface";
import userService from "../users/user.service";
import hasherUtils from "../../../utils/hasher.utils";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";

/**
 * Auth Service
 *
 * Core business logic layer for authentication operations.
 * The service follows the dependency injection pattern and
 * implements the AuthServiceInterface for consistency.
 */
class AuthService implements AuthServiceInterface {
  constructor(private userService: UserServiceInterface) {}

  /**
   * Authenticates a user by validating their email and password credentials.
   * This method verifies that the email exists in the database and that
   * the provided password matches the stored hashed password.
   */
  async login(data: LoginInput): Promise<User> {
    const user = await this.userService.findByEmail(data.email);

    if (!(await hasherUtils.comparePass(data.password, user.password)))
      throw new CustomError(
        "Invalid credentials",
        HttpStatus.BAD_REQUEST,
        "BAD_REQUEST",
      );

    // decronstructed user for quit password and not exposed.
    const { password: _password, ...userData } = user;
    return userData as User;
  }
}

export default new AuthService(userService);
