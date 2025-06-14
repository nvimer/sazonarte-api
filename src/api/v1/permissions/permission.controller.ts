import { Request, Response } from "express";
import permissionService from "./permission.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.validator";
import { PermissionServiceInterface } from "./interfaces/permission.service.interface";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  PaginationParams,
} from "../../../interfaces/pagination.interfaces";

class PermissionController {
  constructor(private permissionService: PermissionServiceInterface) {}

  getPermissions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    const params: PaginationParams = { page, limit };

    const permissions = await this.permissionService.findAllPermissions(params);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "All permissions",
      data: permissions,
    });
  });

  getPermissionById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const permission = await this.permissionService.findPermissionById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permission fetched successfully",
      data: permission,
    });
  });

  postPermission = asyncHandler(async (req: Request, res: Response) => {
    const data: CreatePermissionInput = req.body;

    const newPermission = await this.permissionService.createPermission(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: `New permission with ID ${newPermission.id} has been created successfully`,
      data: newPermission,
    });
  });

  patchPermission = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data: UpdatePermissionInput = req.body;

    const updatedPermission = await this.permissionService.updatePermission(
      id,
      data,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: `New permission with ID ${updatedPermission.id} has been updated successfully`,
      data: updatedPermission,
    });
  });

  deletePermission = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    await this.permissionService.deletePermission(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Permission with ID ${id} has been deleted successfully`,
    });
  });
}

export default new PermissionController(permissionService);
