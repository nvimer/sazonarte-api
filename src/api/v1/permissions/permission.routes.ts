import { Router } from "express";
import { roleMiddleware } from "../../../middlewares/role.middleware";
import { RoleName } from "@prisma/client";
import { authJwt } from "../../../middlewares/auth.middleware";
import permissionController from "./permission.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { paginationQuerySchema } from "../../../utils/pagination.schema";

const router = Router();

router.get(
  "/",
  // authJwt,
  // roleMiddleware([RoleName.ADMIN]),
  validate(paginationQuerySchema),
  permissionController.getPermissions,
);

router.get(
  "/:id",
  // roleMiddleware([RoleName.ADMIN]),
  permissionController.getPermissionById,
);

router.post(
  "/",
  // roleMiddleware([RoleName.ADMIN]),
  permissionController.postPermission,
);

router.patch(
  "/:id",
  // roleMiddleware([RoleName.ADMIN]),
  permissionController.patchPermission,
);

router.delete(
  "/:id",
  // roleMiddleware([RoleName.ADMIN]),
  permissionController.deletePermission,
);

export default router;
