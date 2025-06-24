import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import rolePermissionService from "./role-permissions.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { PaginationParams } from "../../../interfaces/pagination.interfaces";

/**
 * Role Permission Controller
 *
 * Handles HTTP requests for role permission management operations.
 * This controller is responsible for:
 * - Processing incoming HTTP requests for role-permission operations
 * - Extracting and validating request data
 * - Delegating business logic to the role permission service
 * - Formatting and returning HTTP responses
 *
 * All methods use asyncHandler for consistent error handling
 * and are designed to work with the role permission service layer.
 *
 * Role permission management includes:
 * - Retrieving roles with their associated permissions
 * - Assigning permissions to roles (replacement strategy)
 * - Removing specific permissions from roles
 * - Paginated listing of roles with permissions
 */
class RolePermissionController {
  /**
   * GET /roles/permissions/:id
   *
   * Retrieves a specific role with all its associated permissions.
   * This endpoint is essential for role management interfaces and
   * permission auditing purposes.
   *
   * Response:
   * - 200: Role with permissions found and returned
   * - 400: Invalid ID format
   * - 404: Role not found
   *
   * Returns complete role information including all associated permissions.
   * This data is typically used for:
   * - Role editing interfaces
   * - Permission auditing and review
   * - Access control verification
   */
  getRoleWithPermissions = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const role = await rolePermissionService.findRoleWithPermissions(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Role with permissions fetched successfully",
      data: role,
    });
  });

  /**
   * POST /roles/permissions/:id/assign
   *
   * Assigns permissions to a specific role. This operation replaces
   * all existing permissions for the role with the new set provided.
   *
   * Response:
   * - 202: Permissions assigned to role successfully
   * - 400: Invalid request body or ID format
   * - 404: Role not found
   * - 409: Invalid permission IDs provided
   *
   * Assignment Behavior:
   * - Replaces all existing permissions with the new set
   * - Validates that all permission IDs exist
   * - Returns updated role with new permission assignments
   * - Maintains referential integrity
   */
  assignPermissionsToRole = asyncHandler(
    async (req: Request, res: Response) => {
      const roleId = parseInt(req.params.id);
      const { permissionIds } = req.body;

      const role = await rolePermissionService.assignPermissionsToRole(
        roleId,
        permissionIds,
      );
      res.status(HttpStatus.ACCEPTED).json({
        success: true,
        message: "Permissions assigned to role successfully",
        data: role,
      });
    },
  );

  /**
   * DELETE /roles/permissions/:id/remove
   *
   * Removes specific permissions from a role. This operation only
   * removes the specified permissions, leaving other permissions intact.
   *
   * Response:
   * - 202: Permissions removed from role successfully
   * - 400: Invalid request body or ID format
   * - 404: Role not found
   *
   * Removal Behavior:
   * - Only removes the specified permissions
   * - Preserves other existing permissions
   * - Returns updated role with remaining permissions
   * - Safe operation (no effect if permission not assigned)
   */
  removePermissionsFromRole = asyncHandler(
    async (req: Request, res: Response) => {
      const roleId = parseInt(req.params.id);
      const { permissionIds } = req.body;

      const role = await rolePermissionService.removePermissionsFromRole(
        roleId,
        permissionIds,
      );
      res.status(HttpStatus.ACCEPTED).json({
        success: true,
        message: "Permissions removed from role successfully",
        data: role,
      });
    },
  );

  /**
   * GET /roles/permissions
   *
   * Retrieves a paginated list of all roles with their associated permissions.
   * This endpoint is useful for administrative interfaces and permission
   * management dashboards.
   *
   * Response:
   * - 200: Success with paginated roles and permissions data
   * - 400: Invalid pagination parameters
   *
   * The response includes pagination metadata and role data with permissions.
   * This data is typically used for:
   * - Administrative role management
   * - Permission auditing and review
   * - Access control overview
   */
  getRolesWithPermissions = asyncHandler(
    async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);

      const params: PaginationParams = { page, limit };

      const roles = await rolePermissionService.getRolesWithPermissions(params);
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Roles with permissions fetched successfully",
        data: roles,
      });
    },
  );
}

export default new RolePermissionController();
