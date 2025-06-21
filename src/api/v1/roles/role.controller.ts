import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import roleService from "./role.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { CreateRoleInput, UpdateRoleInput } from "./role.validator";
import { PaginationParams } from "../../../interfaces/pagination.interfaces";

/**
 * Role Controller
 *
 * Handles HTTP requests for role management operations.
 * This controller is responsible for:
 * - Processing incoming HTTP requests for role CRUD operations
 * - Extracting and validating request data
 * - Delegating business logic to the role service
 * - Formatting and returning HTTP responses
 *
 * All methods use asyncHandler for consistent error handling
 * and are designed to work with the role service layer.
 *
 * Role management includes:
 * - Basic CRUD operations (Create, Read, Update, Delete)
 * - Search and filtering capabilities
 * - Bulk operations for efficiency
 * - Pagination support for large datasets
 */
class RoleController {
  /**
   * GET /roles
   *
   * Retrieves a paginated list of all roles in the system.
   * This endpoint is typically used for role management interfaces
   * and administrative purposes.
   *
   * @param req - Express request object containing pagination query parameters
   * @param res - Express response object
   *
   * Query Parameters:
   * - page: Page number for pagination (defaults to 1)
   * - limit: Number of items per page (defaults to 10)
   *
   * Response:
   * - 200: Success with paginated roles data
   * - 400: Invalid pagination parameters
   *
   * The response includes pagination metadata and role data.
   */
  getRoles = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const params: PaginationParams = { page, limit };

    const roles = await roleService.findAll(params);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  });

  /**
   * GET /roles/search
   *
   * Searches and filters roles based on various criteria.
   * This endpoint provides advanced filtering capabilities for
   * role management and administrative interfaces.
   *
   * @param req - Express request object containing search and filter parameters
   * @param res - Express response object
   *
   * Query Parameters:
   * - page: Page number for pagination (defaults to 1)
   * - limit: Number of items per page (defaults to 10)
   * - search: Text search term for role name or description
   * - active: Filter by active status (true/false/undefined for all)
   *
   * Response:
   * - 200: Success with filtered and paginated roles data
   * - 400: Invalid search parameters
   *
   * Search functionality includes:
   * - Text-based search in role names and descriptions
   * - Active status filtering
   * - Combined pagination and filtering
   */
  searchRoles = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const search = req.query.search as string;
    const active =
      req.query.active === "true"
        ? true
        : req.query.active === "false"
          ? false
          : undefined;

    const params: PaginationParams = { page, limit };

    const roles = await roleService.searchRoles(params, search, active);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Roles searched successfully",
      data: roles,
    });
  });

  /**
   * GET /roles/:id
   *
   * Retrieves a specific role by its unique identifier.
   * This endpoint is used for role details and editing interfaces.
   *
   * @param req - Express request object containing role ID in params
   * @param res - Express response object
   *
   * URL Parameters:
   * - id: Role ID (integer)
   *
   * Response:
   * - 200: Role found and returned
   * - 400: Invalid ID format
   * - 404: Role not found
   *
   * Returns complete role information including associated permissions.
   */
  getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const role = await roleService.findById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Role fetched successfully",
      data: role,
    });
  });

  /**
   * POST /roles
   *
   * Creates a new role in the system.
   * This endpoint handles role creation with optional permission assignments
   * and validation of role name uniqueness.
   *
   * @param req - Express request object containing role creation data
   * @param res - Express response object
   *
   * Request Body:
   * - name: Role name (required, must be unique)
   * - description: Role description (optional)
   * - active: Role active status (optional, defaults to true)
   * - permissionIds: Array of permission IDs to assign (optional)
   *
   * Response:
   * - 201: Role created successfully
   * - 400: Invalid request data
   * - 409: Role name already exists
   *
   * The response includes the created role with assigned permissions.
   */
  postRole = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateRoleInput = req.body;

    const role = await roleService.createRole(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  });

  /**
   * PATCH /roles/:id
   *
   * Updates an existing role's information.
   * This endpoint supports partial updates, allowing clients
   * to update only specific fields without affecting others.
   *
   * @param req - Express request object containing role ID and update data
   * @param res - Express response object
   *
   * URL Parameters:
   * - id: Role ID (integer)
   *
   * Request Body (all fields optional):
   * - name: Role name (must be unique if changed)
   * - description: Role description
   * - active: Role active status
   *
   * Response:
   * - 202: Role updated successfully
   * - 400: Invalid request data
   * - 404: Role not found
   * - 409: Role name already exists (if name is being changed)
   *
   * Only the fields provided in the request body will be updated.
   */
  patchRole = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: UpdateRoleInput = req.body;

    const role = await roleService.updateRole(id, data);
    res.status(HttpStatus.ACCEPTED).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  });

  /**
   * DELETE /roles/:id
   *
   * Deletes a specific role from the system.
   * This endpoint performs soft deletion to maintain data integrity
   * and preserve historical relationships.
   *
   * @param req - Express request object containing role ID
   * @param res - Express response object
   *
   * URL Parameters:
   * - id: Role ID (integer)
   *
   * Response:
   * - 200: Role deleted successfully
   * - 400: Invalid ID format
   * - 404: Role not found
   * - 409: Role cannot be deleted (has active users)
   *
   * Deletion Behavior:
   * - Performs soft delete (marks as deleted)
   * - Validates no active users are assigned to the role
   * - Maintains referential integrity
   */
  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const role = await roleService.deleteRole(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Role deleted successfully",
      data: role,
    });
  });

  /**
   * DELETE /roles/bulk
   *
   * Deletes multiple roles in a single operation.
   * This endpoint provides efficient bulk deletion for administrative
   * operations and cleanup tasks.
   *
   * @param req - Express request object containing array of role IDs
   * @param res - Express response object
   *
   * Request Body:
   * - ids: Array of role IDs to delete
   *
   * Response:
   * - 200: Bulk deletion completed
   * - 400: Invalid request data
   * - 409: Some roles cannot be deleted (have active users)
   *
   * Bulk Operation Features:
   * - Processes multiple roles in a single request
   * - Returns count of successfully deleted roles
   * - Handles partial failures gracefully
   * - Maintains data integrity across all operations
   *
   * Use Cases:
   * - Administrative cleanup
   * - Bulk role management
   * - System maintenance operations
   */
  bulkDeleteRoles = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;

    const result = await roleService.bulkDeleteRoles(ids);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `${result.deletedCount} roles deleted successfully`,
      data: result,
    });
  });
}

export default new RoleController();
