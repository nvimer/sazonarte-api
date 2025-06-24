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
 */
router.get(
  "/:id",
  validate(permissionIdSchema),
  permissionController.getPermissionById,
);

/**
 * PATCH /permissions/:id
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
 */
router.delete(
  "/bulk",
  validate(bulkPermissionSchema),
  permissionController.bulkDeletePermissions,
);

export default router;
