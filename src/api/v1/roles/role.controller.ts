import { Request, Response } from "express";
import { CreateRoleInput, UpdateRoleInput } from "./role.validator";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import { RoleServiceInterface } from "./interfaces/role.service.interface";
import roleService from "./role.service";
import { Http } from "winston/lib/winston/transports";

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

  getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    const role = await this.roleService.findRoleById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Role fetched successfully",
      data: role,
    });
  });

  postRole = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateRoleInput = req.body;
    const newRole = await this.roleService.createRole(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: `New role with ID ${newRole.id} has been created successfully`,
      data: newRole,
    });
  });

  patchRole = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: UpdateRoleInput = req.body;

    const updatedRole = await this.roleService.updateRole(id, data);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Role with ID ${id} has been updated successfully`,
      data: updatedRole,
    });
  });

  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    await this.roleService.deleteRole(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Role with ID ${id} has been deleted successfully`,
    });
  });
}

export default new RoleController(roleService);
