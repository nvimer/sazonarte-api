import { Router } from "express";
import permissionController from "./permission.controller";
import { validate } from "../../../middlewares/validation.middleware";
import {
  createPermissionSchema,
  idPermissionSchema,
  updatePermissionSchema,
} from "./permission.validator";

const router = Router();

router.get("/", permissionController.getPermissions);
router.post(
  "/",
  validate(createPermissionSchema),
  permissionController.postPermission,
);

router.get(
  "/:id",
  validate(idPermissionSchema),
  permissionController.getPermissionById,
);
router.patch(
  "/:id",
  validate(updatePermissionSchema),
  permissionController.patchPermission,
);
router.delete(
  "/:id",
  validate(idPermissionSchema),
  permissionController.deletePermission,
);

export default router;
