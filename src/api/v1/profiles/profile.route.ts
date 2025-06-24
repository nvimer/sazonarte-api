import { Router } from "express";
import { validate } from "../../../middlewares/validation.middleware";
import { profileIdSchema, updateProfileSchema } from "./profile.validator";
import profileController from "./profile.controller";
import { paginationQuerySchema } from "../../../utils/pagination.schema";

/**
 * Express Router for Profile endpoints.
 *
 * This router defines all profile management operations:
 * - GET / - Retrieve paginated list of user profiles
 * - GET /:id - Retrieve a specific user profile by ID
 * - PATCH /:id - Update an existing user profile
 *
 */
const router = Router();

/**
 * GET /profiles
 *
 * Retrieves a paginated list of all user profiles.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 *
 * Validation:
 * - paginationQuerySchema: Validates pagination query parameters
 *
 * Response:
 * - 200: Success with paginated profiles data
 * - 400: Invalid pagination parameters
 *
 */
router.get("/", validate(paginationQuerySchema), profileController.getProfiles);

/**
 * GET /profiles/:id
 *
 * Retrieves a specific user profile by ID.
 *
 * URL Parameters:
 * - id: Profile ID (UUID string)
 *
 * Validation:
 * - profileIdSchema: Validates ID parameter format (UUID)
 *
 * Response:
 * - 200: Profile found and returned
 * - 400: Invalid ID format
 * - 404: Profile not found
 *
 */
router.get("/:id", validate(profileIdSchema), profileController.getProfile);

/**
 * PATCH /profiles/:id
 *
 * Updates an existing user profile.
 *
 * URL Parameters:
 * - id: Profile ID (UUID string)
 *
 * Validation:
 * - profileIdSchema: Validates ID parameter format (UUID)
 * - updateProfileSchema: Validates request body
 *
 * Response:
 * - 202: Profile updated successfully
 * - 400: Invalid request body or ID format
 * - 404: Profile not found
 * - 409: Email already exists (if email is being changed)
 *
 */
router.patch(
  "/:id",
  validate(profileIdSchema),
  validate(updateProfileSchema),
  profileController.updateProfile,
);

export default router;
