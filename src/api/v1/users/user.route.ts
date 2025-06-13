import { Router } from "express";
import { validate } from "../../../middlewares/validation.middleware";
import { userIdSchema } from "./user.validator";
import userController from "./user.controller";
import { paginationQuerySchema } from "../../../utils/pagination.schema";

const router = Router();

router.get("/", validate(paginationQuerySchema), userController.getUsers);

router.get("/:id", validate(userIdSchema), userController.getUser);

router.patch("/:id", validate(userIdSchema), userController.updateUser);

export default router;
