import { Router } from "express";
import permissionController from "./permission.controller";
import { validate } from "../../../middlewares/validation.middleware";
import {
  createPermissionSchema,
  permissionIdSchema,
  updatePermissionSchema,
  permissionSearchSchema,
  bulkPermissionSchema,
} from "./permission.validator";
import { paginationQuerySchema } from "../../../utils/pagination.schema";

/**
 * Express Router for Permission endpoints.
 *
 * This router defines all CRUD operations for permissions:
 * - GET / - Retrieve paginated list of permissions
 * - GET /search - Search permissions with filtering
 * - POST / - Create a new permission
 * - GET /:id - Retrieve a specific permission by ID
 * - PATCH /:id - Update an existing permission
 * - DELETE /:id - Soft delete a permission
 * - DELETE /bulk - Bulk soft delete permissions
 *
 * All routes include appropriate validation middleware to ensure
 * data integrity and proper error handling.
 */
const router = Router();

/**
 * GET /permissions
 *
 * Retrieves a paginated list of all non-deleted permissions.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 *
 * Validation:
 * - paginationQuerySchema: Validates pagination query parameters
 *
 * Response:
 * - 200: Success with paginated permissions data
 * - 400: Invalid pagination parameters
 *
 * Example: GET /permissions?page=1&limit=20
 */
router.get(
  "/",
  validate(paginationQuerySchema),
  permissionController.getPermissions,
);

/**
 * GET /permissions/search
 *
 * Searches for permissions with optional filtering and pagination.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 * - search: Search term for filtering permissions by name (optional)
 * - active: Filter by active status (true/false, optional)
 *
 * Validation:
 * - permissionSearchSchema: Validates search and filter parameters
 * - paginationQuerySchema: Validates pagination parameters
 *
 * Response:
 * - 200: Success with filtered and paginated permissions data
 * - 400: Invalid search or pagination parameters
 *
 * Example: GET /permissions/search?search=read&active=true&page=1&limit=10
 */
router.get(
  "/search",
  validate(permissionSearchSchema),
  validate(paginationQuerySchema),
  permissionController.searchPermissions,
);

/**
 * POST /permissions
 *
 * Creates a new permission.
 *
 * Request Body:
 * - name: Permission name (string, 2-50 characters, must be unique)
 * - description: Permission description (string, 5-255 characters)
 *
 * Validation:
 * - createPermissionSchema: Validates required fields and data types
 *
 * Response:
 * - 201: Permission created successfully
 * - 400: Invalid request body
 * - 409: Permission with same name already exists
 *
 * Example:
 * POST /permissions
 * {
 *   "name": "READ_USERS",
 *   "description": "Permission to read user data"
 * }
 */
router.post(
  "/",
  validate(createPermissionSchema),
  permissionController.postPermission,
);

/**
 * GET /permissions/:id
 *
 * Retrieves a specific permission by its ID.
 *
 * URL Parameters:
 * - id: Permission ID (number)
 *
 * Validation:
 * - permissionIdSchema: Validates ID parameter format
 *
 * Response:
 * - 200: Permission found and returned
 * - 400: Invalid ID format
 * - 404: Permission not found
 *
 * Example: GET /permissions/123
 */
router.get(
  "/:id",
  validate(permissionIdSchema),
  permissionController.getPermissionById,
);

/**
 * PATCH /permissions/:id
 *
 * Updates an existing permission.
 *
 * URL Parameters:
 * - id: Permission ID (number)
 *
 * Request Body (all fields optional, but at least one required):
 * - name: Permission name (string, 2-50 characters, must be unique)
 * - description: Permission description (string, 5-255 characters)
 *
 * Validation:
 * - permissionIdSchema: Validates ID parameter format
 * - updatePermissionSchema: Validates request body (partial update)
 *
 * Response:
 * - 200: Permission updated successfully
 * - 400: Invalid request body or ID format
 * - 404: Permission not found
 * - 409: Update would create duplicate name
 *
 * Example:
 * PATCH /permissions/123
 * {
 *   "name": "WRITE_USERS",
 *   "description": "Permission to write user data"
 * }
 */
router.patch(
  "/:id",
  validate(permissionIdSchema),
  validate(updatePermissionSchema),
  permissionController.patchPermission,
);

/**
 * DELETE /permissions/:id
 *
 * Soft deletes a permission by setting the deleted flag to true.
 *
 * URL Parameters:
 * - id: Permission ID (number)
 *
 * Validation:
 * - permissionIdSchema: Validates ID parameter format
 *
 * Response:
 * - 200: Permission soft deleted successfully
 * - 400: Invalid ID format or permission already deleted
 * - 404: Permission not found
 *
 * Example: DELETE /permissions/123
 */
router.delete(
  "/:id",
  validate(permissionIdSchema),
  permissionController.deletePermission,
);

/**
 * DELETE /permissions/bulk
 *
 * Soft deletes multiple permissions in bulk.
 *
 * Request Body:
 * - ids: Array of permission IDs to delete (1-100 IDs)
 *
 * Validation:
 * - bulkPermissionSchema: Validates array of permission IDs
 *
 * Response:
 * - 200: Permissions bulk deleted successfully
 * - 400: Invalid request body or no valid IDs provided
 *
 * Example:
 * DELETE /permissions/bulk
 * {
 *   "ids": [1, 2, 3, 4, 5]
 * }
 */
router.delete(
  "/bulk",
  validate(bulkPermissionSchema),
  permissionController.bulkDeletePermissions,
);

export default router;
