import { Request, Response } from "express";
import permissionService from "./permission.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionSearchParams,
  BulkPermissionInput,
} from "./permission.validator";
import { PermissionServiceInterface } from "./interfaces/permission.service.interface";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  PaginationParams,
} from "../../../interfaces/pagination.interfaces";

/**
 * Controller class for Permission HTTP operations
 * Handles all HTTP requests and responses for permission management
 */
class PermissionController {
  constructor(private permissionService: PermissionServiceInterface) {}

  /**
   * GET /permissions
   * Get all permissions with pagination
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns Paginated list of permissions
   */
  getPermissions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    const params: PaginationParams = { page, limit };

    const permissions = await this.permissionService.findAllPermissions(params);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permissions fetched successfully",
      data: permissions,
    });
  });

  /**
   * GET /permissions/search
   * Search permissions with filtering and pagination
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns Paginated list of filtered permissions
   */
  searchPermissions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
    const search = req.query.search as string;
    const active =
      req.query.active === "true"
        ? true
        : req.query.active === "false"
          ? false
          : undefined;

    // Create combined parameters object
    const params: PaginationParams & PermissionSearchParams = {
      page,
      limit,
      search,
      active,
    };

    const permissions = await this.permissionService.searchPermissions(params);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permissions search completed successfully",
      data: permissions,
    });
  });

  /**
   * GET /permissions/:id
   * Get a specific permission by ID
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns Single permission object
   */
  getPermissionById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const permission = await this.permissionService.findPermissionById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permission fetched successfully",
      data: permission,
    });
  });

  /**
   * POST /permissions
   * Create a new permission
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns Created permission object
   */
  postPermission = asyncHandler(async (req: Request, res: Response) => {
    const data: CreatePermissionInput = req.body;

    const newPermission = await this.permissionService.createPermission(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Permission created successfully",
      data: newPermission,
    });
  });

  /**
   * PATCH /permissions/:id
   * Update an existing permission
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns Updated permission object
   */
  patchPermission = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data: UpdatePermissionInput = req.body;

    const updatedPermission = await this.permissionService.updatePermission(
      id,
      data,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permission updated successfully",
      data: updatedPermission,
    });
  });

  /**
   * DELETE /permissions/:id
   * Soft delete a permission
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns Success message with deleted permission info
   */
  deletePermission = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    const deletedPermission = await this.permissionService.deletePermission(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Permission with ID ${id} has been deleted successfully`,
      data: {
        id: deletedPermission.id,
        name: deletedPermission.name,
      },
    });
  });

  /**
   * DELETE /permissions/bulk
   * Bulk delete multiple permissions
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns Success message with count of deleted permissions
   */
  bulkDeletePermissions = asyncHandler(async (req: Request, res: Response) => {
    const data: BulkPermissionInput = req.body;

    const deletedCount =
      await this.permissionService.bulkDeletePermissions(data);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `${deletedCount} permissions have been deleted successfully`,
      data: {
        deletedCount,
        ids: data.ids,
      },
    });
  });
}

export default new PermissionController(permissionService);
