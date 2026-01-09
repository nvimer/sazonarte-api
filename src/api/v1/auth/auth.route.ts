import { Router } from "express";
import authController from "./auth.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { loginSchema, registerSchema } from "./auth.validator";
import { authJwt } from "../../../middlewares/auth.middleware";

const router = Router();

/**
 * POST /auth/register
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * POST /auth/login
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * POST /auth/logout
 */
router.post("/logout", authJwt, authController.logout);

export default router;
