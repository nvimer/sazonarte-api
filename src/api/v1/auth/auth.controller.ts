import { Request, Response } from "express";
import userService from "../users/user.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import { LoginInput, RegisterInput } from "./auth.validator";
import authService from "./auth.service";
import { AuthServiceInterface } from "./interfaces/auth.service.interface";
import { TokenServiceInterface } from "./tokens/token.interface";
import tokenService from "./tokens/token.service";

class AuthController {
  constructor(
    private authService: AuthServiceInterface,
    private tokenService: TokenServiceInterface,
  ) {}

  // This controller is user for route /register and create a new user of system
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

  // This operation can be login to user for access to protected routes
  login = asyncHandler(async (req: Request, res: Response) => {
    const data: LoginInput = req.body;

    // Pass data to auth service for validate credentials like email (verify if exxists) and password (verify if pass ind data and pass saved matched-)
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
