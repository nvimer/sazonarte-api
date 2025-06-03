import { Router } from "express";
import authController from "./auth.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { createUserSchema } from "../users/user.validator";

const router = Router();

router.post("/register", validate(createUserSchema), authController.postUser);

export default router;
