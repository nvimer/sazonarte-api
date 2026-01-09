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

const router = Router();

/**
 * Role permissions management sub-router
 * This sub-router handles all role permission operations:
 */
router.use("/permissions", rolePermissionsRouter);

/**
 * GET /roles
 * Retrieves a paginated list of all non-deleted roles.
 */
router.get("/", validate(paginationQuerySchema), roleController.getRoles);

/**
 * GET /roles/search
 * Searches for roles with optional filtering and pagination.
 */
router.get(
  "/search",
  validate(roleSearchSchema),
  validate(paginationQuerySchema),
  roleController.searchRoles,
);

/**
 * POST /roles
 * Creates a new role with optional permissions.
 */
router.post("/", validate(createRoleSchema), roleController.postRole);

/**
 * GET /roles/:id
 * Retrieves a specific role by its ID.
 */
router.get("/:id", validate(roleIdSchema), roleController.getRoleById);

/**
 * PATCH /roles/:id
 * Updates an existing role.
 */
router.patch(
  "/:id",
  validate(roleIdSchema),
  validate(updateRoleSchema),
  roleController.patchRole,
);

/**
 * DELETE /roles/:id
 * Soft deletes a role by setting the deleted flag to true.
 */
router.delete("/:id", validate(roleIdSchema), roleController.deleteRole);

/**
 * DELETE /roles/bulk
 * Soft deletes multiple roles in bulk.
 */
router.delete(
  "/bulk",
  validate(bulkRoleSchema),
  roleController.bulkDeleteRoles,
);

export default router;
