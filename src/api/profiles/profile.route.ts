import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { profileIdSchema, updateProfileSchema } from "./profile.validator";
import profileController from "./profile.controller";
import { paginationQuerySchema } from "../../utils/pagination.schema";
import { authJwt } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * GET /profiles
 * Retrieves a paginated list of all user profiles.
 */
router.get("/", validate(paginationQuerySchema), profileController.getProfiles);

/**
 * GET /profiles/me
 * Retrieves the authenticated user's own profile
 */

router.get("/me", authJwt, profileController.getMyProfile);

/**
 * GET /profiles/:id
 * Retrieves a specific user profile by ID.
 */
router.get("/:id", validate(profileIdSchema), profileController.getProfile);

/**
 * PATCH /profiles/:id
 * Updates an existing user profile.
 */
router.patch(
  "/:id",
  validate(profileIdSchema),
  validate(updateProfileSchema),
  profileController.updateProfile,
);

export default router;
