import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import profileService from "./profile.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { PaginationParams } from "../../../interfaces/pagination.interfaces";
import { UpdateProfileInput } from "./profile.validator";
import { logger } from "../../../config/logger";

/**
 * Profile Controller
 *
 * Handles HTTP requests for user profile management operations.
 * This controller is responsible for:
 * - Processing incoming HTTP requests for profile operations
 * - Extracting and validating request data
 * - Delegating business logic to the profile service
 * - Formatting and returning HTTP responses
 *
 * Profile management includes:
 * - Profile retrieval and listing
 * - Profile updates and modifications
 * - Pagination support for large datasets
 * - User-specific profile operations
 */
class ProfileController {
  /**
   * GET /profiles
   *
   * Retrieves a paginated list of all user profiles in the system.
   * This endpoint is typically used for administrative purposes
   * and user management interfaces.
   *
   * Query Parameters:
   * - page: Page number for pagination (defaults to 1)
   * - limit: Number of items per page (defaults to 10)
   *
   * Response:
   * - 200: Success with paginated profiles data
   * - 400: Invalid pagination parameters
   *
   */
  getProfiles = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const params: PaginationParams = { page, limit };

    const profiles = await profileService.findAll(params);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Profiles fetched successfully",
      data: profiles,
    });
  });

  /**
   * GET /profiles/:id
   *
   * Retrieves a specific user profile by its unique identifier.
   * This endpoint is used for profile details and editing interfaces.
   *
   * URL Parameters:
   * - id: Profile ID (UUID string)
   *
   * Response:
   * - 200: Profile found and returned
   * - 400: Invalid ID format
   * - 404: Profile not found
   *
   * Returns complete profile information including associated user data.
   * This endpoint is commonly used for:
   * - Profile viewing and editing
   * - User dashboard displays
   * - Administrative user management
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;

    const profile = await profileService.findById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  });

  /**
   * PATCH /profiles/:id
   *
   * Updates an existing user profile's information.
   * This endpoint supports partial updates, allowing clients
   * to update only specific profile fields without affecting others.
   *
   * URL Parameters:
   * - id: Profile ID (UUID string)
   *
   * Request Body (all fields optional):
   * - name: User's full name
   * - email: User's email address (must be unique if changed)
   * - phone: User's phone number
   * - Additional profile-specific fields
   *
   * Response:
   * - 202: Profile updated successfully
   * - 400: Invalid request data
   * - 404: Profile not found
   * - 409: Email already exists (if email is being changed)
   *
   * Update Behavior:
   * - Only the fields provided in the request body will be updated
   * - Maintains data integrity and validation
   * - Supports profile-specific and user-related updates
   * - Preserves existing data for non-provided fields
   *
   * Use Cases:
   * - User profile editing
   * - Administrative profile management
   * - Profile information updates
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data: UpdateProfileInput = req.body;

    logger.info(`aqui si llega el id:  ${id}`);
    const profileUpdated = await profileService.updateUser(id, data);

    res.status(HttpStatus.ACCEPTED).json({
      success: true,
      message: "Profile updated successfully",
      data: profileUpdated,
    });
  });
}

export default new ProfileController();
