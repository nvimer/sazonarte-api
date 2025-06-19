import { Request, Response } from "express";
import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleSearchParams,
  BulkRoleInput,
} from "./role.validator";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import { RoleServiceInterface } from "./interfaces/role.service.interface";
import roleService from "./role.service";
import { PaginationParams } from "../../../interfaces/pagination.interfaces";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from "../../../interfaces/pagination.interfaces";

/**
 * Controller class responsible for handling HTTP requests related to roles.
 * Provides CRUD operations for roles through RESTful endpoints.
 *
 * This controller implements proper error handling, validation, and
 * consistent response formatting across all endpoints.
 */
class RoleController {
  constructor(private roleService: RoleServiceInterface) {}

  /**
   * GET /roles - Retrieves a paginated list of all roles
   *
   * @param req - Express request object containing query parameters for pagination
   * @param res - Express response object to send the response
   *
   * Query Parameters:
   * - page: Page number for pagination (default: DEFAULT_PAGE)
   * - limit: Number of items per page (default: DEFAULT_LIMIT)
   *
   * Returns:
   * - HTTP 200 with paginated roles data
   * - Success message and roles array with permissions
   */
  getRoles = asyncHandler(async (req: Request, res: Response) => {
    // Extract pagination parameters from query string with fallback to defaults
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    // Create pagination parameters object
    const params: PaginationParams = { page, limit };

    // Fetch roles from service layer with pagination
    const roles = await this.roleService.findAllRoles(params);

    // Return successful response with roles data
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  });

  /**
   * GET /roles/search - Searches for roles with optional filtering and pagination
   *
   * @param req - Express request object containing search and pagination parameters
   * @param res - Express response object to send the response
   *
   * Query Parameters:
   * - page: Page number for pagination (default: DEFAULT_PAGE)
   * - limit: Number of items per page (default: DEFAULT_LIMIT)
   * - search: Search term for filtering roles by name (optional)
   * - active: Filter by active status (true/false, optional)
   *
   * Returns:
   * - HTTP 200 with paginated search results
   * - Success message and filtered roles array
   */
  searchRoles = asyncHandler(async (req: Request, res: Response) => {
    // Extract pagination and search parameters
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
    const params: PaginationParams & RoleSearchParams = {
      page,
      limit,
      search,
      active,
    };

    // Search roles from service layer
    const roles = await this.roleService.searchRoles(params);

    // Return successful response with search results
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Roles search completed successfully",
      data: roles,
    });
  });

  /**
   * GET /roles/:id - Retrieves a specific role by its ID
   *
   * @param req - Express request object containing the role ID in params
   * @param res - Express response object to send the response
   *
   * URL Parameters:
   * - id: The unique identifier of the role to retrieve
   *
   * Returns:
   * - HTTP 200 with the specific role data
   * - Success message and role object with permissions
   *
   * Throws:
   * - 404 if role is not found (handled by service layer)
   */
  getRoleById = asyncHandler(async (req: Request, res: Response) => {
    // Extract and convert role ID from URL parameters
    const id = parseInt(req.params.id, 10);

    // Fetch specific role from service layer
    const role = await this.roleService.findRoleById(id);

    // Return successful response with role data
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Role fetched successfully",
      data: role,
    });
  });

  /**
   * POST /roles - Creates a new role
   *
   * @param req - Express request object containing role data in body
   * @param res - Express response object to send the response
   *
   * Request Body:
   * - CreateRoleInput: Validated role creation data
   *
   * Returns:
   * - HTTP 201 (Created) with the newly created role
   * - Success message and created role object with permissions
   *
   * Throws:
   * - 400 if validation fails (handled by validator middleware)
   * - 409 if role with same name already exists (handled by service layer)
   */
  postRole = asyncHandler(async (req: Request, res: Response) => {
    // Extract validated role data from request body
    const data: CreateRoleInput = req.body;

    // Create new role through service layer
    const newRole = await this.roleService.createRole(data);

    // Return successful response with created role
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: `Role "${newRole.name}" created successfully`,
      data: newRole,
    });
  });

  /**
   * PATCH /roles/:id - Updates an existing role
   *
   * @param req - Express request object containing role ID in params and update data in body
   * @param res - Express response object to send the response
   *
   * URL Parameters:
   * - id: The unique identifier of the role to update
   *
   * Request Body:
   * - UpdateRoleInput: Validated role update data (partial)
   *
   * Returns:
   * - HTTP 202 (Accepted) with the updated role
   * - Success message and updated role object with permissions
   *
   * Throws:
   * - 400 if validation fails (handled by validator middleware)
   * - 404 if role is not found (handled by service layer)
   * - 409 if update would create duplicate name (handled by service layer)
   */
  patchRole = asyncHandler(async (req: Request, res: Response) => {
    // Extract validated update data from request body
    const data: UpdateRoleInput = req.body;

    // Extract and convert role ID from URL parameters
    const id = parseInt(req.params.id);

    // Update role through service layer
    const updatedRole = await this.roleService.updateRole(id, data);

    // Return successful response with updated role
    res.status(HttpStatus.ACCEPTED).json({
      success: true,
      message: `Role "${updatedRole.name}" updated successfully`,
      data: updatedRole,
    });
  });

  /**
   * DELETE /roles/:id - Soft deletes a role
   *
   * @param req - Express request object containing the role ID in params
   * @param res - Express response object to send the response
   *
   * URL Parameters:
   * - id: The unique identifier of the role to delete
   *
   * Returns:
   * - HTTP 200 with the soft-deleted role data
   * - Success message and deleted role object
   *
   * Throws:
   * - 404 if role is not found (handled by service layer)
   * - 400 if role is already deleted (handled by service layer)
   */
  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    // Extract and convert role ID from URL parameters
    const id = parseInt(req.params.id, 10);

    // Soft delete role through service layer
    const deletedRole = await this.roleService.deleteRole(id);

    // Return successful response with deleted role
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Role "${deletedRole.name}" deleted successfully`,
      data: deletedRole,
    });
  });

  /**
   * DELETE /roles/bulk - Soft deletes multiple roles in bulk
   *
   * @param req - Express request object containing array of role IDs in body
   * @param res - Express response object to send the response
   *
   * Request Body:
   * - BulkRoleInput: Object containing array of role IDs to delete
   *
   * Returns:
   * - HTTP 200 with count of successfully deleted roles
   * - Success message and deletion count
   *
   * Throws:
   * - 400 if no valid IDs provided (handled by service layer)
   */
  bulkDeleteRoles = asyncHandler(async (req: Request, res: Response) => {
    // Extract validated bulk delete data from request body
    const data: BulkRoleInput = req.body;

    // Perform bulk delete through service layer
    const deletedCount = await this.roleService.bulkDeleteRoles(data);

    // Return successful response with deletion count
    res.status(HttpStatus.OK).json({
      success: true,
      message: `${deletedCount} roles deleted successfully`,
      data: { deletedCount },
    });
  });
}

// Export a singleton instance of the controller with injected service dependency
export default new RoleController(roleService);
