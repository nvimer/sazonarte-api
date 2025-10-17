import { User } from "@prisma/client";
import profileRepository from "./profile.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { ProfileServiceInterface } from "./interfaces/profile.service.interface";
import { ProfileRepositoryInterface } from "./interfaces/profile.repository.interface";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { UpdateProfileInput } from "./profile.validator";
import { UserWithProfile } from "../../../types/prisma.types";

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
 */
class ProfileServices implements ProfileServiceInterface {
  constructor(private profileRepository: ProfileRepositoryInterface) { }

  /**
   * Validates that a user/profile exists by ID and returns the user if found.
   * This method is used across multiple operations to ensure
   * the user exists before performing any modifications.
   *
   * Error Codes:
   * - ID_NOT_FOUND: User with the specified ID doesn't exist
   *
   * This method is private as it's an internal validation helper
   * used by other service methods to ensure data integrity.
   */
  private async findByIdOrFail(id: string): Promise<UserWithProfile> {
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
   * Error Codes:
   * - ID_NOT_FOUND: User with the specified ID doesn't exist
   *
   * Returns complete user information including profile data.
   */
  async findById(id: string): Promise<UserWithProfile> {
    return this.findByIdOrFail(id);
  }

  /**
   * Updates an existing user's profile information.
   * This method supports partial updates and includes validation
   * to ensure data integrity and uniqueness.
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
   *
   * Use Cases:
   * - User profile editing
   * - Administrative profile management
   * - Profile information updates
   */
  async updateUser(
    id: string,
    data: UpdateProfileInput,
  ): Promise<UserWithProfile> {
    await this.findByIdOrFail(id);
    return this.profileRepository.update(id, data);
  }
}

export default new ProfileServices(profileRepository);
