import { Router } from "express";
import authController from "./auth.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { loginSchema, registerSchema } from "./auth.validator";

/**
 * This router defines all authentication and authorization operations:
 * - POST /register - Register a new user account
 * - POST /login - Authenticate user and generate JWT token
 *
 */
const router = Router();

/**
 * Registers a new user in the system and creates their account.
 * This endpoint handles the complete user registration process.
 *
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * Authenticates a user and generates a JWT token for session management.
 * This endpoint validates user credentials and creates an authenticated session.
 *
 */
router.post("/login", validate(loginSchema), authController.login);

export default router;
