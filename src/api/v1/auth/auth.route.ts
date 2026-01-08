import { Router } from "express";
import authController from "./auth.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { loginSchema, registerSchema } from "./auth.validator";
import { authJwt } from "../../../middlewares/auth.middleware";

const router = Router();

/**
 * POST /auth/register
 *
 * Registers a new user in the system and creates their account.
 * This endpoint handles the complete user registration process.
 *
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * POST /auth/login
 *
 * Authenticates a user and generates a JWT token for session management.
 * This endpoint validates user credentials and creates an authenticated session.
 *
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * POST /auth/logout
 *
 * Logs out the authenticated user.
 * Requires valid JWT token in Authorization header.
 */
router.post("/logout", authJwt, authController.logout);

export default router;
