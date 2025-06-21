import { Router } from "express";
import { validate } from "../../../middlewares/validation.middleware";
import { userIdSchema } from "./user.validator";
import { paginationQuerySchema } from "../../../utils/pagination.schema";
import userController from "./user.controller";

/**
 * Express Router for User endpoints.
 *
 * This router defines all user management operations:
 * - GET / - Retrieve paginated list of users
 * - GET /:id - Retrieve a specific user by ID
 * - GET /email/:email - Retrieve a user by email address
 * - POST /register - Register a new user
 * - PATCH /:id - Update an existing user
 * - GET /:id/roles-permissions - Get user with their roles and permissions
 *
 */
const router = Router();

/**
 * GET /users
 *
 * Retrieves a paginated list of all non-deleted users.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 *
 * Validation:
 * - paginationQuerySchema: Validates pagination query parameters
 *
 * Response:
 * - 200: Success with paginated users data
 * - 400: Invalid pagination parameters
 *
 */
router.get("/", validate(paginationQuerySchema), userController.getUsers);

/**
 * GET /users/:id
 *
 * Retrieves a specific user by their ID.
 *
 * URL Parameters:
 * - id: User ID (UUID string)
 *
 * Validation:
 * - userIdSchema: Validates ID parameter format (UUID)
 *
 * Response:
 * - 200: User found and returned
 * - 400: Invalid ID format
 * - 404: User not found
 *
 */
router.get("/:id", validate(userIdSchema), userController.getUserById);

/**
 * GET /users/email/:email
 *
 * Retrieves a user by their email address.
 *
 * URL Parameters:
 * - email: User's email address
 *
 * Response:
 * - 200: User found and returned
 * - 404: User not found
 *
 */
router.get("/email/:email", userController.getUserByEmail);

/**
 * POST /users/register
 *
 * Registers a new user in the system.
 *
 * Request Body:
 * - name: User's full name (string, required)
 * - email: User's email address (string, required, must be unique)
 * - password: User's password (string, required, min 6 characters)
 * - phone: User's phone number (string, optional)
 * - roleIds: Array of role IDs to assign to the user (number[], optional)
 *
 * Validation:
 * - Registration data validation handled in controller
 *
 * Response:
 * - 201: User registered successfully (password excluded from response)
 * - 400: Invalid request body
 * - 409: Email already exists
 *
 */
router.post("/register", userController.registerUser);

/**
 * PATCH /users/:id
 *
 * Updates an existing user's information.
 *
 * URL Parameters:
 * - id: User ID (UUID string)
 *
 * Request Body (all fields optional):
 * - name: User's full name (string)
 * - email: User's email address (string, must be unique if changed)
 * - phone: User's phone number (string)
 *
 * Validation:
 * - userIdSchema: Validates ID parameter format (UUID)
 * - Update data validation handled in controller
 *
 * Response:
 * - 202: User updated successfully
 * - 400: Invalid request body or ID format
 * - 404: User not found
 * - 409: Email already exists (if email is being changed)
 *
 */
router.patch("/:id", validate(userIdSchema), userController.updateUser);

/**
 * GET /users/:id/roles-permissions
 *
 * Retrieves a user with their complete role and permission information.
 * This endpoint is useful for authentication and authorization purposes.
 *
 * URL Parameters:
 * - id: User ID (UUID string)
 *
 * Validation:
 * - userIdSchema: Validates ID parameter format (UUID)
 *
 * Response:
 * - 200: User with roles and permissions found and returned
 * - 400: Invalid ID format
 * - 404: User not found
 *
 * Response includes:
 * - User basic information
 * - Associated roles
 * - Permissions from all assigned roles
 *
 */
router.get(
  "/:id/roles-permissions",
  validate(userIdSchema),
  userController.getUserWithRolesAndPermissions,
);

export default router;
