import { Request, Response } from "express";
import userService from "../users/user.service";
import { HttpStatus } from "../../utils/httpStatus.enum";
import { asyncHandler } from "../../utils/asyncHandler";
import { LoginInput, RegisterInput } from "./auth.validator";
import authService from "./auth.service";
import { AuthServiceInterface } from "./interfaces/auth.service.interface";
import { TokenServiceInterface } from "./tokens/token.interface";
import tokenService from "./tokens/token.service";

/**
 * Auth Controller
 */
class AuthController {
  constructor(
    private authService: AuthServiceInterface,
    private tokenService: TokenServiceInterface,
  ) {}

  /**
   * POST /auth/register
   *
   * Registers a new user in the system and creates their account.
   * This endpoint handles the complete user registration process including
   * validation, account creation, and initial setup.
   *
   * Request Body:
   * - firstName: User's first name (string, required)
   * - lastName: User's last name (string, required)
   * - email: User's email address (string, required, must be unique)
   * - password: User's password (string, required, min 6 characters)
   * - phone: User's phone number (string, optional)
   * - roleIds: Array of role IDs to assign (number[], optional)
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterInput = req.body;

    const newUser = await userService.register(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  });

  /**
   * POST /auth/login
   *
   * Authenticates a user and generates a JWT token for session management.
   * This endpoint validates user credentials and creates an authenticated
   * session for accessing protected routes.
   *
   * Request Body:
   * - email: User's email address (string, required)
   * - password: User's password (string, required)
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const data: LoginInput = req.body;

    const user = await this.authService.login(data);

    const token = await this.tokenService.generateAuthToken(user.id);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Token created successfully",
      data: token,
    });
  });

  /**
   * POST /auth/logout
   *
   * Logs out authenticated user by invalidating refresh tokens.
   * This endpoint requieres authentication and uses the user ID from the JWT token.
   *
   * Authentication: Required (JWT token)
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    await this.tokenService.logout(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  });
}

export default new AuthController(authService, tokenService);
