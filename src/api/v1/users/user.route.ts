import { Router } from "express";
import { validate } from "../../../middlewares/validation.middleware";
import { userIdSchema } from "./user.validator";
import userController from "./user.controller";

const router = Router();

router.get("/", userController.getUsers);

router.get("/:id", validate(userIdSchema), userController.getUser);

export default router;
