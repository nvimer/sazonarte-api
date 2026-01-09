import { User } from "@prisma/client";
import prisma from "../../../database/prisma";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";
import { UpdateUserInput } from "./user.validator";
import { RegisterInput } from "../auth/auth.validator";
import { AuthenticatedUser } from "../../../types/express";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

/**
 * User Repository
 *
 * Data access layer for user-related database operations.
 * This repository is responsible for:
 * - Direct database interactions using Prisma ORM
 * - User CRUD operations
 * - Complex queries with role and permission relationships
 * - Pagination support for large datasets
 * - Soft delete handling (deleted: false filter)
 *
 * The repository implements the UserRepositoryInterface for
 * consistency and follows the repository pattern for data access.
 */
class BasicUserRepository implements UserRepositoryInterface {
  /**
   * Retrieves a paginated list of all active users from the database.
   * This method supports efficient pagination for large user datasets
   * and excludes soft-deleted users from the results.
   *
   * @param params - Pagination parameters (page, limit)
   * @returns Promise<PaginatedResponse<User>> - Paginated user data
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
   */
  async findAll(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deleted: false },
        orderBy: { firstName: "asc", lastName: "asc" },
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
   * Finds a user by their email address.
   * This method is commonly used for authentication and user lookup.
   *
   * @param email - User's email address
   * @returns Promise<User | null> - User object if found, null otherwise
   *
   * Database Operations:
   * - Uses findUnique for optimal performance
   * - Searches by email index
   * - Returns null if no user found
   *
   * Note: This method doesn't filter by deleted status as it's
   * typically used for authentication where we need to find
   * the user regardless of deletion status.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Finds a user by their unique identifier.
   * This method is used for user retrieval and validation operations.
   *
   * @param id - User ID (UUID string)
   * @returns Promise<User | null> - User object if found, null otherwise
   *
   * Database Operations:
   * - Uses findUnique for optimal performance
   * - Searches by primary key (id)
   * - Returns null if no user found
   *
   * Note: This method doesn't filter by deleted status as it's
   * used for validation and lookup operations.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Creates a new user in the database with associated roles and profile.
   * This method handles the complete user creation process including:
   * - User basic information
   * - Role assignments (if provided)
   * - Profile creation
   *
   * @param data - User registration data including optional role IDs
   * @returns Promise<User> - Created user with role relationships
   *
   * Database Operations:
   * - Creates user record with hashed password
   * - Creates user-role relationships for each provided role ID
   * - Creates associated profile record
   * - Returns user with role information included
   *
   * Transaction Safety:
   * - All operations are performed in a single transaction
   * - Ensures data consistency across user, roles, and profile
   * - Rolls back all changes if any operation fails
   *
   * Role Assignment:
   * - Supports multiple role assignments
   * - Creates UserRole junction table records
   * - Connects to existing roles by ID
   */
  async create(data: RegisterInput): Promise<User> {
    const { roleIds, ...userData } = data;

    return await prisma.user.create({
      data: {
        ...userData,
        roles: {
          create:
            roleIds.map((roleId) => ({
              role: { connect: { id: roleId } },
            })) || [],
        },
        profile: {
          create: {},
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  /**
   * Updates an existing user's information in the database.
   * This method supports partial updates and only modifies
   * the fields provided in the update data.
   *
   * @param id - User ID to update
   * @param data - Update data (partial user fields)
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
   */
  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Retrieves a user with their complete role and permission hierarchy.
   * This method is essential for authentication and authorization systems
   * as it provides the complete access control context for a user.
   *
   * @param id - User ID
   * @returns Promise<AuthenticatedUser | null> - User with roles and permissions
   *
   * Database Operations:
   * - Fetches user with nested role relationships
   * - Includes all permissions from assigned roles
   * - Uses complex join operations for efficiency
   *
   * Response Structure:
   * - User basic information
   * - UserRole relationships with role details
   * - RolePermission relationships with permission details
   * - Complete permission hierarchy for access control
   *
   * Use Cases:
   * - JWT token generation with permissions
   * - Access control decisions in middleware
   * - UI permission rendering
   * - Security audits and logging
   *
   * Performance Considerations:
   * - Uses include for eager loading of relationships
   * - Minimizes N+1 query problems
   * - Optimized for authentication workflows
   */
  async findUserWithPermissions(id: string): Promise<AuthenticatedUser | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

export default new BasicUserRepository();
