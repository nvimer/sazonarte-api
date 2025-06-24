import { Request, Response } from "express";
import userService from "../users/user.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import { LoginInput, RegisterInput } from "./auth.validator";
import authService from "./auth.service";
import { AuthServiceInterface } from "./interfaces/auth.service.interface";
import { TokenServiceInterface } from "./tokens/token.interface";
import tokenService from "./tokens/token.service";

/**
 * Auth Controller
 *
 * Handles HTTP requests for authentication and authorization operations.
 * This controller is responsible for:
 * - Processing incoming HTTP requests for authentication
 * - User registration and account creation
 * - User login and credential validation
 * - Token generation and session management
 * - Delegating business logic to auth and token services
 *
 * Authentication flow includes:
 * - User registration with validation
 * - Login with credential verification
 * - JWT token generation for session management
 * - Integration with user service for account creation
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
   * - name: User's full name (string, required)
   * - email: User's email address (string, required, must be unique)
   * - password: User's password (string, required, min 6 characters)
   * - phone: User's phone number (string, optional)
   * - roleIds: Array of role IDs to assign (number[], optional)
   *
   * Validation:
   * - RegisterInput schema validates all required fields
   * - Email uniqueness is enforced
   * - Password strength requirements
   *
   * Response:
   * - 201: User registered successfully (password excluded from response)
   * - 400: Invalid request data
   * - 409: Email already exists
   *
   * Security Features:
   * - Password is hashed before storage
   * - Email uniqueness validation
   * - Role assignment during registration
   * - Sensitive data excluded from response
   *
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    // Valid entry data with Zod.
    const data: RegisterInput = req.body;

    // call user service for create a user with entry data
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
   *
   * Validation:
   * - LoginInput schema validates credential format
   * - Email existence verification
   * - Password matching verification
   *
   * Response:
   * - 200: Login successful with JWT token
   * - 400: Invalid credentials format
   * - 401: Invalid email or password
   * - 404: User not found
   *
   * Authentication Flow:
   * - Validates email exists in system
   * - Verifies password matches stored hash
   * - Generates JWT token for session
   * - Returns token for client storage
   *
   * Security Features:
   * - Password hashing comparison
   * - JWT token generation
   * - Session management
   * - Secure credential validation
   *
   * Token Management:
   * - Uses tokenService for JWT generation
   * - Token includes user ID for identification
   * - Token can be used for protected route access
   * - Session persistence through token storage
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const data: LoginInput = req.body;

    // Pass data to auth service for validate credentials like email (verify if exists) and password (verify if pass ind data and pass saved matched-)
    const user = await this.authService.login(data);
    // If user exists, generate a new token and save this token for manage session with jwt
    const token = await this.tokenService.generateAuthToken(user.id);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Token created successfully",
      data: token,
    });
  });
}

export default new AuthController(authService, tokenService);
