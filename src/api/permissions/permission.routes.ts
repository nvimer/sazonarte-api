import { Router } from "express";
import permissionController from "./permission.controller";
import { paginationQuerySchema } from "../../utils/pagination.schema";
import { validate } from "../../middlewares/validation.middleware";
import {
  bulkPermissionSchema,
  createPermissionSchema,
  permissionIdSchema,
  permissionSearchSchema,
  updatePermissionSchema,
} from "./permission.validator";

const router = Router();

/**
 * GET /permissions
 * Retrieves a paginated list of all non-deleted permissions.
 */
router.get(
  "/",
  validate(paginationQuerySchema),
  permissionController.getPermissions,
);

/**
 * GET /permissions/search
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
 * Creates a new permission.
 */
router.post(
  "/",
  validate(createPermissionSchema),
  permissionController.postPermission,
);

/**
 * GET /permissions/:id
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
 * Soft deletes a permission by setting the deleted flag to true.
 */
router.delete(
  "/:id",
  validate(permissionIdSchema),
  permissionController.deletePermission,
);

/**
 * DELETE /permissions/bulk
 * Soft deletes multiple permissions in bulk.
 */
router.delete(
  "/bulk",
  validate(bulkPermissionSchema),
  permissionController.bulkDeletePermissions,
);

export default router;
