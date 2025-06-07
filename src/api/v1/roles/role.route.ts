import { Router } from "express";
import roleController from "./role.controller";
import { validate } from "../../../middlewares/validation.middleware";
import {
  createRoleSchema,
  roleIdSchema,
  updateRoleSchema,
} from "./role.validator";
import { authJwt } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/", authJwt, roleController.getRoles);
router.post("/", validate(createRoleSchema), roleController.postRole);

router.get("/:id", validate(roleIdSchema), roleController.getRoleById);
router.patch("/:id", validate(updateRoleSchema), roleController.patchRole);
router.delete("/:id", validate(roleIdSchema), roleController.deleteRole);

export default router;
