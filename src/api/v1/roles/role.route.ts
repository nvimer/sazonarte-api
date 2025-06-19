import { Router } from "express";
import roleController from "./role.controller";
import { validate } from "../../../middlewares/validation.middleware";
import {
  createRoleSchema,
  roleIdSchema,
  updateRoleSchema,
} from "./role.validator";
import { paginationQuerySchema } from "../../../utils/pagination.schema";

const router = Router();

router.get("/", validate(paginationQuerySchema), roleController.getRoles);
router.get("/:id", validate(roleIdSchema), roleController.getRoleById);
router.post("/", validate(createRoleSchema), roleController.postRole);
router.patch("/:id", validate(updateRoleSchema), roleController.patchRole);
router.delete("/:id", validate(roleIdSchema), roleController.deleteRole);

export default router;
