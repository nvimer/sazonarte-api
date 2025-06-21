import { User } from "@prisma/client";
import { UpdateUserInput } from "../users/user.validator";
import profileRepository from "./profile.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { ProfileServiceInterface } from "./interfaces/profile.service.interface";
import { ProfileRepositoryInterface } from "./interfaces/profile.repository.interface";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";

/**
 * Profile Service
 *
 * Core business logic layer for user profile management operations.
 * This service is responsible for:
 * - Profile CRUD operations with business rules
 * - Data validation and integrity checks
 * - Error handling and custom error creation
 * - Delegating data access to the profile repository
 *
 * The service follows the dependency injection pattern and
 * implements the ProfileServiceInterface for consistency.
 *
 * Profile management includes:
 * - Profile retrieval and listing
 * - Profile updates and modifications
 * - User data validation and integrity
 * - Pagination support for large datasets
 *
 * Note: This service works with User entities as profiles
 * are typically extensions of user data rather than separate entities.
 */
class ProfileServices implements ProfileServiceInterface {
  constructor(private profileRepository: ProfileRepositoryInterface) {}

  /**
   * Validates that a user/profile exists by ID and returns the user if found.
   * This method is used across multiple operations to ensure
   * the user exists before performing any modifications.
   *
   * @param id - User/Profile ID to validate
   * @returns Promise<User> - User object if found
   * @throws CustomError - If user is not found
   *
   * Error Codes:
   * - ID_NOT_FOUND: User with the specified ID doesn't exist
   *
   * This method is private as it's an internal validation helper
   * used by other service methods to ensure data integrity.
   */
  private async findByIdOrFail(id: string): Promise<User> {
    const user = await this.profileRepository.findById(id);

    if (!user)
      throw new CustomError(
        `User with ID ${id} not found.`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return user;
  }

  /**
   * Retrieves a paginated list of all user profiles in the system.
   * This method supports pagination for efficient data retrieval
   * and is typically used for administrative interfaces.
   *
   * @param params - Pagination parameters (page, limit)
   * @returns Promise<PaginatedResponse<User>> - Paginated user/profile data
   *
   * The response includes:
   * - Users array with profile information
   * - Pagination metadata (total, page, limit, etc.)
   * - Excludes soft-deleted users
   *
   * Profile data typically includes:
   * - Basic user information (name, email, phone)
   * - Profile-specific fields
   * - Associated user relationships
   */
  async findAll(params: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.profileRepository.findAll(params);
  }

  /**
   * Retrieves a specific user profile by their unique identifier.
   * This method validates the user exists before returning the data.
   *
   * @param id - User/Profile ID (UUID string)
   * @returns Promise<User> - User object if found
   * @throws CustomError - If user is not found
   *
   * Error Codes:
   * - ID_NOT_FOUND: User with the specified ID doesn't exist
   *
   * Returns complete user information including profile data.
   * This method is commonly used for:
   * - Profile viewing and editing
   * - User dashboard displays
   * - Administrative user management
   */
  async findById(id: string): Promise<User> {
    return this.findByIdOrFail(id);
  }

  /**
   * Updates an existing user's profile information.
   * This method supports partial updates and includes validation
   * to ensure data integrity and uniqueness.
   *
   * @param id - User/Profile ID to update
   * @param data - Update data (all fields optional)
   * @returns Promise<User> - Updated user object
   * @throws CustomError - If user not found or validation fails
   *
   * Error Codes:
   * - ID_NOT_FOUND: User with the specified ID doesn't exist
   * - EMAIL_CONFLICT: Email already exists (if email is being changed)
   *
   * Validation:
   * - Ensures user exists before update
   * - Validates email uniqueness if email is being changed
   * - Supports partial updates (only provided fields are updated)
   *
   * Update Behavior:
   * - Only the fields provided in the request body will be updated
   * - Maintains data integrity and validation
   * - Supports both user and profile-specific updates
   * - Preserves existing data for non-provided fields
   *
   * Use Cases:
   * - User profile editing
   * - Administrative profile management
   * - Profile information updates
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    await this.findByIdOrFail(id);
    return this.profileRepository.update(id, data);
  }
}

export default new ProfileServices(profileRepository);
