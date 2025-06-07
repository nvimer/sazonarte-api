import { Router } from "express";
import authController from "./auth.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { loginSchema, registerSchema } from "./auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

export default router;
