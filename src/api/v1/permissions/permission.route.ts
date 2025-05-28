import { Router } from "express";
import permissionController from "./permission.controller";

const router = Router();

// router.get("/", permissionController.getPermission);
router.post("/", permissionController.postPermission);

// router.get("/:id", permissionController.getPermissionById);
router.patch("/:id", permissionController.patchPermission);
router.delete("/:id", permissionController.deletePermission);

export default router;
