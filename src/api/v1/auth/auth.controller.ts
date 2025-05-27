import { NextFunction, Request, Response } from "express";
import userService from "../users/user.service";
import { CreateUserInput, createUserSchema } from "../users/user.validator";
import { HttpStatus } from "../../../utils/httpStatus.enum";

class AuthController {
  async postUser(req: Request, res: Response, next: NextFunction) {
    try {
      // Valid entry data with Zod.
      const data: CreateUserInput = createUserSchema.parse(req.body);

      const newUser = await userService.createUser(data);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      //Pass the error to middleware
      next(error);
    }
  }
}

export default new AuthController();
