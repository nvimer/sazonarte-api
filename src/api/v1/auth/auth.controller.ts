import { Request, Response } from "express";
import userService from "../users/user.service";
import { CreateUserInput } from "../users/user.validator";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";

class AuthController {
  postUser = asyncHandler(async (req: Request, res: Response) => {
    // Valid entry data with Zod.
    const data: CreateUserInput = req.body;

    const newUser = await userService.createUser(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  });
}

export default new AuthController();
