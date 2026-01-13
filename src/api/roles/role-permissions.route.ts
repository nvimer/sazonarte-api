import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import {
  roleIdSchema,
  assignPermissionsSchema,
  removePermissionsSchema,
} from "./role.validator";
import { paginationQuerySchema } from "../../utils/pagination.schema";
import rolePermissionController from "./role-permissions.controller";

const router = Router();

/**
 * GET /roles/permissions
 * Retrieves a paginated list of all roles with their associated permissions.
 * This endpoint is useful for displaying role-permission relationships
 * in admin interfaces or for audit purposes.
 */
router.get(
  "/",
  validate(paginationQuerySchema),
  rolePermissionController.getRolesWithPermissions,
);

/**
 * GET /roles/permissions/:id
 * Retrieves a specific role with all its associated permissions.
 * This endpoint is useful for viewing or editing role permissions.
 */
router.get(
  "/:id",
  validate(roleIdSchema),
  rolePermissionController.getRoleWithPermissions,
);

/**
 * POST /roles/permissions/:id/assign
 * Assigns permissions to a specific role. This operation replaces
 * all existing permissions for the role with the new set provided.
 */
router.post(
  "/:id/assign",
  validate(roleIdSchema),
  validate(assignPermissionsSchema),
  rolePermissionController.assignPermissionsToRole,
);

/**
 * DELETE /roles/permissions/:id/remove
 * Removes specific permissions from a role. This operation only
 * removes the specified permissions, leaving other permissions intact.
 */
router.delete(
  "/:id/remove",
  validate(roleIdSchema),
  validate(removePermissionsSchema),
  rolePermissionController.removePermissionsFromRole,
);

export default router;
