import { Router } from "express";
import { validate } from "../../../middlewares/validation.middleware";
import { userIdSchema } from "./user.validator";
import { paginationQuerySchema } from "../../../utils/pagination.schema";
import userController from "./user.controller";

const router = Router();

/**
 * GET /users
 * Retrieves a paginated list of all non-deleted users.
 */
router.get("/", validate(paginationQuerySchema), userController.getUsers);

/**
 * GET /users/:id
 * Retrieves a specific user by their ID.
 */
router.get("/:id", validate(userIdSchema), userController.getUserById);

/**
 * GET /users/email/:email
 * Retrieves a user by their email address.
 */
router.get("/email/:email", userController.getUserByEmail);

/**
 * POST /users/register
 * Registers a new user in the system.
 */
router.post("/register", userController.registerUser);

/**
 * PATCH /users/:id
 * Updates an existing user's information.
 */
router.patch("/:id", validate(userIdSchema), userController.updateUser);

/**
 * GET /users/:id/roles-permissions
 * Retrieves a user with their complete role and permission information.
 * This endpoint is useful for authentication and authorization purposes.
 */
router.get(
  "/:id/roles-permissions",
  validate(userIdSchema),
  userController.getUserWithRolesAndPermissions,
);

export default router;
