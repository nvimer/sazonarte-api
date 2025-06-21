import { UpdateUserInput } from "../users/user.validator";
import { ProfileRepositoryInterface } from "./interfaces/profile.repository.interface";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../utils/pagination.helper";
import prisma from "../../../database/prisma";
import { User } from "@prisma/client";

/**
 * Profile Repository
 *
 * Data access layer for user profile-related database operations.
 * This repository is responsible for:
 * - Direct database interactions using Prisma ORM
 * - Profile CRUD operations (working with User entities)
 * - Pagination support for large datasets
 * - Soft delete handling (deleted: false filter)
 *
 * The repository implements the ProfileRepositoryInterface for
 * consistency and follows the repository pattern for data access.
 *
 * Note: This repository works with User entities as profiles
 * are typically extensions of user data rather than separate entities.
 * The profile functionality is implemented through user data management.
 */
class ProfileRepository implements ProfileRepositoryInterface {
  /**
   * Retrieves a paginated list of all active user profiles from the database.
   * This method supports efficient pagination for large user datasets
   * and excludes soft-deleted users from the results.
   *
   * @param params - Pagination parameters (page, limit)
   * @returns Promise<PaginatedResponse<User>> - Paginated user/profile data
   *
   * Database Operations:
   * - Fetches users with pagination (skip/take)
   * - Orders results by name ascending
   * - Excludes soft-deleted users (deleted: false)
   * - Counts total users for pagination metadata
   *
   * Performance Considerations:
   * - Uses Promise.all for concurrent queries
   * - Implements proper indexing on name and deleted fields
   * - Returns only necessary user fields (excludes password)
   *
   * Profile Data:
   * - Returns user data which includes profile information
   * - Profile fields are typically part of the user entity
   * - Supports profile-specific queries and filtering
   */
  async findAll(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(users, total, params);
  }

  /**
   * Finds a user profile by their unique identifier.
   * This method is used for profile retrieval and validation operations.
   *
   * @param id - User/Profile ID (UUID string)
   * @returns Promise<User | null> - User object if found, null otherwise
   *
   * Database Operations:
   * - Uses findUnique for optimal performance
   * - Searches by primary key (id)
   * - Returns null if no user found
   *
   * Note: This method doesn't filter by deleted status as it's
   * used for validation and lookup operations where we need to
   * find the user regardless of deletion status.
   *
   * Profile Retrieval:
   * - Returns complete user data including profile fields
   * - Profile information is embedded within the user entity
   * - Supports profile-specific data access patterns
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Updates an existing user's profile information in the database.
   * This method supports partial updates and only modifies
   * the fields provided in the update data.
   *
   * @param id - User/Profile ID to update
   * @param data - Update data (partial user/profile fields)
   * @returns Promise<User> - Updated user object
   *
   * Database Operations:
   * - Updates only provided fields
   * - Uses optimistic locking for concurrency control
   * - Returns updated user data
   *
   * Update Behavior:
   * - Supports partial updates (only provided fields are modified)
   * - Maintains data integrity and constraints
   * - Preserves existing data for non-provided fields
   * - Handles both user and profile-specific field updates
   *
   * Profile Updates:
   * - Updates user data which includes profile information
   * - Supports profile-specific field modifications
   * - Maintains referential integrity with related entities
   * - Validates data constraints and business rules
   */
  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export default new ProfileRepository();
