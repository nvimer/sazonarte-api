import { Router } from "express";
import { validate } from "../../../middlewares/validation.middleware";
import {
  createRoleSchema,
  roleIdSchema,
  updateRoleSchema,
  roleSearchSchema,
  bulkRoleSchema,
} from "./role.validator";
import { paginationQuerySchema } from "../../../utils/pagination.schema";
import roleController from "./role.controller";
import rolePermissionsRouter from "./role-permissions.route";

/**
 * Express Router for Role endpoints.
 *
 * This router defines all role management operations:
 * - GET / - Retrieve paginated list of roles
 * - GET /search - Search roles with filtering
 * - POST / - Create a new role
 * - GET /:id - Retrieve a specific role by ID
 * - PATCH /:id - Update an existing role
 * - DELETE /:id - Soft delete a role
 * - DELETE /bulk - Bulk soft delete roles
 * - /permissions/* - Role permissions management (sub-router)
 *
 */
const router = Router();

/**
 * Role permissions management sub-router
 *
 * This sub-router handles all role permission operations:
 * - GET /permissions/ - Get all roles with permissions
 * - GET /permissions/:id - Get role with permissions
 * - POST /permissions/:id/assign - Assign permissions to role
 * - DELETE /permissions/:id/remove - Remove permissions from role
 */
router.use("/permissions", rolePermissionsRouter);

/**
 * GET /roles
 *
 * Retrieves a paginated list of all non-deleted roles.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 *
 * Validation:
 * - paginationQuerySchema: Validates pagination query parameters
 *
 * Response:
 * - 200: Success with paginated roles data
 * - 400: Invalid pagination parameters
 *
 */
router.get("/", validate(paginationQuerySchema), roleController.getRoles);

/**
 * GET /roles/search
 *
 * Searches for roles with optional filtering and pagination.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 * - search: Search term for filtering roles by name (optional)
 * - active: Filter by active status (true/false, optional)
 *
 * Validation:
 * - roleSearchSchema: Validates search and filter parameters
 * - paginationQuerySchema: Validates pagination parameters
 *
 * Response:
 * - 200: Success with filtered and paginated roles data
 * - 400: Invalid search or pagination parameters
 *
 */
router.get(
  "/search",
  validate(roleSearchSchema),
  validate(paginationQuerySchema),
  roleController.searchRoles,
);

/**
 * POST /roles
 *
 * Creates a new role with optional permissions.
 *
 * Request Body:
 * - name: Role name (enum from RoleName)
 * - description: Role description (string, max 255 characters)
 * - permissionIds: Array of permission IDs (optional)
 *
 * Validation:
 * - createRoleSchema: Validates required fields and data types
 *
 * Response:
 * - 201: Role created successfully
 * - 400: Invalid request body
 * - 409: Role with same name already exists
 */
router.post("/", validate(createRoleSchema), roleController.postRole);

/**
 * GET /roles/:id
 *
 * Retrieves a specific role by its ID.
 *
 * URL Parameters:
 * - id: Role ID (number)
 *
 * Validation:
 * - roleIdSchema: Validates ID parameter format
 *
 * Response:
 * - 200: Role found and returned
 * - 400: Invalid ID format
 * - 404: Role not found
 *
 */
router.get("/:id", validate(roleIdSchema), roleController.getRoleById);

/**
 * PATCH /roles/:id
 *
 * Updates an existing role.
 *
 * URL Parameters:
 * - id: Role ID (number)
 *
 * Request Body (all fields optional, but at least one required):
 * - name: Role name (enum from RoleName)
 * - description: Role description (string, max 255 characters)
 * - permissionIds: Array of permission IDs
 *
 * Validation:
 * - roleIdSchema: Validates ID parameter format
 * - updateRoleSchema: Validates request body (partial update)
 *
 * Response:
 * - 202: Role updated successfully
 * - 400: Invalid request body or ID format
 * - 404: Role not found
 * - 409: Update would create duplicate name
 *
 */
router.patch(
  "/:id",
  validate(roleIdSchema),
  validate(updateRoleSchema),
  roleController.patchRole,
);

/**
 * DELETE /roles/:id
 *
 * Soft deletes a role by setting the deleted flag to true.
 *
 * URL Parameters:
 * - id: Role ID (number)
 *
 * Validation:
 * - roleIdSchema: Validates ID parameter format
 *
 * Response:
 * - 200: Role soft deleted successfully
 * - 400: Invalid ID format or role already deleted
 * - 404: Role not found
 *
 */
router.delete("/:id", validate(roleIdSchema), roleController.deleteRole);

/**
 * DELETE /roles/bulk
 *
 * Soft deletes multiple roles in bulk.
 *
 * Validation:
 * - bulkRoleSchema: Validates array of role IDs
 *
 * Response:
 * - 200: Roles bulk deleted successfully
 * - 400: Invalid request body or no valid IDs provided
 *
 */
router.delete(
  "/bulk",
  validate(bulkRoleSchema),
  roleController.bulkDeleteRoles,
);

export default router;
