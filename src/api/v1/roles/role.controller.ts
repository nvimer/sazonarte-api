import { NextFunction, Request, Response } from "express";
import { CreateRoleInput } from "./role.validator";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import { RoleServiceInterface } from "./interfaces/role.service.interface";
import roleService from "./role.service";

class RoleController {
  constructor(private roleService: RoleServiceInterface) {}

  getRoles = asyncHandler(async (req: Request, res: Response) => {
    const roles = await this.roleService.findAllRoles();
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  });

  postRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateRoleInput = req.body;
      const newRole = await this.roleService.createRole(data);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Role created successfully",
        data: newRole,
      });
    } catch (error) {
      next(error);
    }
  };
}
export default new RoleController(roleService);
