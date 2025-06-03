import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import userService from "./user.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";

class UserController {
  getUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.findAll();
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Users fetched success",
      data: users,
    });
  });

  getUser = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;

    const user = await userService.findById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  });
}

export default new UserController();
