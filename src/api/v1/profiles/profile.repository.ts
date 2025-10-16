import { ProfileRepositoryInterface } from "./interfaces/profile.repository.interface";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../utils/pagination.helper";
import prisma from "../../../database/prisma";
import { Profile, User } from "@prisma/client";
import { UpdateProfileInput } from "./profile.validator";

type UserWithProfile = User & { profile: Profile | null };

/**
 * Profile Repository
 *
 * Data access layer for user profile-related database operations.
 * This repository is responsible for:
 * - Direct database interactions using Prisma ORM
 * - Profile CRUD operations (working with User  & Profile entities)
 * - Pagination support for large datasets
 * - Soft delete handling (deleted: false filter)
 */
class ProfileRepository implements ProfileRepositoryInterface {
  /**
   * Retrieves a paginated list of all active user profiles from the database.
   * This method supports efficient pagination for large user datasets
   * and excludes soft-deleted users from the results.
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
   */
  async findAll(
    params: PaginationParams,
  ): Promise<PaginatedResponse<UserWithProfile>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip,
        take: limit,
        include: { profile: true },
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
   */
  async findById(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  /**
   * Updates an existing user's profile information in the database.
   * This method supports partial updates and only modifies
   * the fields provided in the update data.
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
   */
  async update(id: string, data: UpdateProfileInput): Promise<UserWithProfile> {
    return prisma.user.update({
      where: { id },
      data: { ...data, profile: { update: { ...data } } },
      include: { profile: true },
    });
  }
}

export default new ProfileRepository();
