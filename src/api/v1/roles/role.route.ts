import { Router } from "express";
import roleController from "./role.controller";
import { validate } from "../../../middlewares/validation.middleware";
import {
  createRoleSchema,
  roleIdSchema,
  updateRoleSchema,
  roleSearchSchema,
  bulkRoleSchema,
} from "./role.validator";
import { paginationQuerySchema } from "../../../utils/pagination.schema";

/**
 * Express Router for Role endpoints.
 *
 * This router defines all CRUD operations for roles:
 * - GET / - Retrieve paginated list of roles
 * - GET /search - Search roles with filtering
 * - POST / - Create a new role
 * - GET /:id - Retrieve a specific role by ID
 * - PATCH /:id - Update an existing role
 * - DELETE /:id - Soft delete a role
 * - DELETE /bulk - Bulk soft delete roles
 *
 * All routes include appropriate validation middleware to ensure
 * data integrity and proper error handling.
 */
const router = Router();

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
 * Example: GET /roles?page=1&limit=20
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
 * Example: GET /roles/search?search=admin&active=true&page=1&limit=10
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
 *
 * Example:
 * POST /roles
 * {
 *   "name": "ADMIN",
 *   "description": "Administrator role with full access",
 *   "permissionIds": [1, 2, 3]
 * }
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
 * Example: GET /roles/123
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
 * Example:
 * PATCH /roles/123
 * {
 *   "name": "MODERATOR",
 *   "description": "Updated moderator role"
 * }
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
 * Example: DELETE /roles/123
 */
router.delete("/:id", validate(roleIdSchema), roleController.deleteRole);

/**
 * DELETE /roles/bulk
 *
 * Soft deletes multiple roles in bulk.
 *
 * Request Body:
 * - ids: Array of role IDs to delete (1-100 IDs)
 *
 * Validation:
 * - bulkRoleSchema: Validates array of role IDs
 *
 * Response:
 * - 200: Roles bulk deleted successfully
 * - 400: Invalid request body or no valid IDs provided
 *
 * Example:
 * DELETE /roles/bulk
 * {
 *   "ids": [1, 2, 3, 4, 5]
 * }
 */
router.delete(
  "/bulk",
  validate(bulkRoleSchema),
  roleController.bulkDeleteRoles,
);

export default router;
