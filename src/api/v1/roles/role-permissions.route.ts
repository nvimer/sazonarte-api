import { Router } from "express";
import { validate } from "../../../middlewares/validation.middleware";
import {
  roleIdSchema,
  assignPermissionsSchema,
  removePermissionsSchema,
} from "./role.validator";
import { paginationQuerySchema } from "../../../utils/pagination.schema";
import rolePermissionController from "./role-permissions.controller";

/**
 * Express Router for Role Permissions endpoints.
 *
 * This router defines all role permission management operations:
 * - GET / - Retrieve paginated list of roles with their permissions
 * - GET /:id - Retrieve a specific role with its permissions
 * - POST /:id/assign - Assign permissions to a role
 * - DELETE /:id/remove - Remove permissions from a role
 *
 */
const router = Router();

/**
 * GET /roles/permissions
 *
 * Retrieves a paginated list of all roles with their associated permissions.
 * This endpoint is useful for displaying role-permission relationships
 * in admin interfaces or for audit purposes.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 *
 * Validation:
 * - paginationQuerySchema: Validates pagination query parameters
 *
 * Response:
 * - 200: Success with paginated roles and permissions data
 * - 400: Invalid pagination parameters
 *
 * Response includes:
 * - Role basic information
 * - Associated permissions for each role
 *
 */
router.get(
  "/",
  validate(paginationQuerySchema),
  rolePermissionController.getRolesWithPermissions,
);

/**
 * GET /roles/permissions/:id
 *
 * Retrieves a specific role with all its associated permissions.
 * This endpoint is useful for viewing or editing role permissions.
 *
 * URL Parameters:
 * - id: Role ID (number)
 *
 * Validation:
 * - roleIdSchema: Validates ID parameter format
 *
 * Response:
 * - 200: Role with permissions found and returned
 * - 400: Invalid ID format
 * - 404: Role not found
 *
 * Response includes:
 * - Role basic information
 * - Complete list of associated permissions
 *
 */
router.get(
  "/:id",
  validate(roleIdSchema),
  rolePermissionController.getRoleWithPermissions,
);

/**
 * POST /roles/permissions/:id/assign
 *
 * Assigns permissions to a specific role. This operation replaces
 * all existing permissions for the role with the new set provided.
 *
 * URL Parameters:
 * - id: Role ID (number)
 *
 * Request Body:
 * - permissionIds: Array of permission IDs to assign (number[], required)
 *
 * Validation:
 * - roleIdSchema: Validates ID parameter format
 * - assignPermissionsSchema: Validates permission IDs array
 *
 * Response:
 * - 202: Permissions assigned to role successfully
 * - 400: Invalid request body or ID format
 * - 404: Role not found
 *
 */
router.post(
  "/:id/assign",
  validate(roleIdSchema),
  validate(assignPermissionsSchema),
  rolePermissionController.assignPermissionsToRole,
);

/**
 * DELETE /roles/permissions/:id/remove
 *
 * Removes specific permissions from a role. This operation only
 * removes the specified permissions, leaving other permissions intact.
 *
 * URL Parameters:
 * - id: Role ID (number)
 *
 * Request Body:
 * - permissionIds: Array of permission IDs to remove (number[], required)
 *
 * Validation:
 * - roleIdSchema: Validates ID parameter format
 * - removePermissionsSchema: Validates permission IDs array
 *
 * Response:
 * - 202: Permissions removed from role successfully
 * - 400: Invalid request body or ID format
 * - 404: Role not found
 *
 */
router.delete(
  "/:id/remove",
  validate(roleIdSchema),
  validate(removePermissionsSchema),
  rolePermissionController.removePermissionsFromRole,
);

export default router;
