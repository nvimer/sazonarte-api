import { NextFunction, Request, Response } from "express";
import { CreateRoleInput, createRoleSchema } from "./role.validator";
import roleService from "./role.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";

class RoleController {
  async postRole(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateRoleInput = createRoleSchema.parse(req.body);
      const newRole = await roleService.createRole(data);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Role created successfully",
        data: newRole,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default new RoleController();
