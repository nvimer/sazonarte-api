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
 * This service is responsible for:
 * - User credential validation and verification
 * - Password hashing and comparison
 * - User authentication logic
 * - Security and data protection
 *
 * The service follows the dependency injection pattern and
 * implements the AuthServiceInterface for consistency.
 *
 * Authentication operations include:
 * - Login credential verification
 * - Password security validation
 * - User data protection and sanitization
 * - Integration with user service for data access
 *
 * Security Features:
 * - Password hashing comparison using bcrypt
 * - User data sanitization (password exclusion)
 * - Secure credential validation
 * - Error handling for invalid credentials
 */
class AuthService implements AuthServiceInterface {
  constructor(private userService: UserServiceInterface) { }

  /**
   * Authenticates a user by validating their email and password credentials.
   * This method verifies that the email exists in the database and that
   * the provided password matches the stored hashed password.
   *
   * Error Codes:
   * - BAD_REQUEST: Invalid email or password combination
   * - NOT_FOUND: User with provided email doesn't exist
   *
   * Authentication Process:
   * - Retrieves user by email from user service
   * - Compares provided password with stored hash
   * - Validates password using bcrypt comparison
   * - Returns user data without password
   *
   * Security Measures:
   * - Uses bcrypt for secure password comparison
   * - Excludes password from returned user data
   * - Provides generic error messages for security
   * - Validates user existence before password check
   *
   * Data Protection:
   * - Password is never returned in response
   * - User data is sanitized before return
   * - Secure error handling prevents information leakage
   *
   * Integration:
   * - Uses userService for user data retrieval
   * - Uses hasherUtils for password comparison
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
