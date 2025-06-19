import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleSearchParams,
} from "./role.validator";
import prisma from "../../../database/prisma";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import { Role } from "@prisma/client";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

/**
 * Repository class responsible for data access operations related to roles.
 * This is the lowest layer in the architecture that directly interacts with the database
 * through Prisma ORM. It handles all CRUD operations for the Role entity.
 *
 * The repository implements the RoleRepositoryInterface and provides a clean
 * abstraction over the database operations, making the code more testable and maintainable.
 */
class RoleRepository implements RoleRepositoryInterface {
  /**
   * Retrieves a paginated list of all non-deleted roles from the database.
   * This method implements efficient pagination by calculating skip/take values
   * and fetching both the data and total count in parallel.
   *
   * @param params - Pagination parameters containing page and limit information
   * @returns Promise<PaginatedResponse<Role>> - Paginated response with roles and metadata
   *
   * Database Operations:
   * - Uses Prisma's findMany with skip/take for pagination
   * - Filters out deleted roles (deleted: false)
   * - Orders results alphabetically by name (ascending)
   * - Fetches total count in parallel for pagination metadata
   *
   * Performance Considerations:
   * - Uses Promise.all for concurrent execution of data and count queries
   * - Applies proper indexing through Prisma's query optimization
   */
  async findAll(params: PaginationParams): Promise<PaginatedResponse<Role>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    // Execute data fetching and count queries in parallel for better performance
    const [roles, total] = await Promise.all([
      // Fetch paginated roles with filtering and ordering
      prisma.role.findMany({
        where: { deleted: false }, // Only include non-deleted roles
        orderBy: { name: "asc" }, // Sort alphabetically by name
        skip, // Skip records for pagination
        take: limit, // Limit number of records returned
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      }),
      // Get total count of non-deleted roles for pagination metadata
      prisma.role.count({
        where: { deleted: false },
      }),
    ]);

    // Create and return paginated response with data and metadata
    return createPaginatedResponse(roles, total, params);
  }

  /**
   * Retrieves a specific role by its unique identifier.
   * This method uses Prisma's findUnique for optimal performance on primary key lookups.
   *
   * @param id - The unique identifier (primary key) of the role to find
   * @returns Promise<Role | null> - The found role or null if not found
   *
   * Database Operations:
   * - Uses Prisma's findUnique for efficient primary key lookup
   * - Returns null if no role exists with the given ID
   * - No filtering applied - returns role regardless of deleted status
   *
   * Note: This method doesn't filter by deleted status, allowing the service layer
   * to handle soft-deleted records as needed for business logic.
   */
  async findById(id: number): Promise<Role | null> {
    return await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Retrieves a role by its name.
   * This method is used for duplicate name checking during creation and updates.
   *
   * @param name - The name of the role to find
   * @returns Promise<Role | null> - The found role or null if not found
   *
   * Database Operations:
   * - Uses Prisma's findFirst for name-based lookup
   * - Filters out deleted roles to avoid conflicts with soft-deleted records
   * - Case-insensitive search using equals
   *
   * Note: This method only searches non-deleted roles to prevent
   * conflicts when creating roles with names that were previously deleted.
   */
  async findByName(name: string): Promise<Role | null> {
    return await prisma.role.findFirst({
      where: {
        name: name as any, // Type assertion for enum compatibility
        deleted: false, // Only search non-deleted roles
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Creates a new role in the database with associated permissions.
   * This method accepts validated input data and creates a new record with permission relationships.
   *
   * @param data - Validated role creation data (CreateRoleInput)
   * @returns Promise<Role> - The newly created role with generated fields and permissions
   *
   * Database Operations:
   * - Uses Prisma's create method to insert new record
   * - Creates permission relationships if permissionIds are provided
   * - Returns the complete created object including auto-generated fields and permissions
   * - Prisma handles data validation and type safety
   *
   * Error Handling:
   * - Prisma will throw errors for constraint violations (e.g., unique name constraint)
   * - These errors are typically handled at the service layer
   *
   * The input data is already validated by the validator layer, ensuring
   * data integrity before reaching the database.
   */
  async create(data: CreateRoleInput): Promise<Role> {
    const { permissionIds, ...roleData } = data;

    return await prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          create:
            permissionIds?.map((permissionId) => ({
              permission: { connect: { id: permissionId } },
            })) || [],
        },
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Updates an existing role in the database.
   * This method updates only the fields provided in the data parameter.
   *
   * @param id - The unique identifier of the role to update
   * @param data - Validated role update data (UpdateRoleInput)
   * @returns Promise<Role> - The updated role object
   *
   * Database Operations:
   * - Uses Prisma's update method for partial updates
   * - Only updates fields provided in the data parameter
   * - Returns the complete updated object
   *
   * Error Handling:
   * - Prisma will throw errors if role with given ID doesn't exist
   * - Prisma will throw errors for constraint violations (e.g., unique name constraint)
   * - These errors are typically handled at the service layer
   *
   * Note: This method assumes the role exists. The service layer should
   * verify existence before calling this method to provide better error messages.
   */
  async update(id: number, data: UpdateRoleInput): Promise<Role> {
    const { permissionIds, ...roleData } = data;

    // If permissionIds are provided, update permissions
    if (permissionIds !== undefined) {
      // First, delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Then create new permissions
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }
    }

    // Update role data
    return await prisma.role.update({
      where: { id },
      data: roleData,
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Soft deletes a role by setting the deleted flag to true.
   * This method implements soft delete to preserve data integrity and allow recovery.
   *
   * @param id - The unique identifier of the role to delete
   * @returns Promise<Role> - The soft-deleted role object
   *
   * Database Operations:
   * - Uses Prisma's update method to set deleted flag to true
   * - Updates the updatedAt timestamp automatically
   * - Returns the updated role object
   *
   * Error Handling:
   * - Prisma will throw errors if role with given ID doesn't exist
   * - These errors are typically handled at the service layer
   *
   * Note: This implements soft delete pattern. The role is not physically
   * removed from the database but marked as deleted for data preservation.
   */
  async delete(id: number): Promise<Role> {
    return await prisma.role.update({
      where: { id },
      data: {
        deleted: true,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Soft deletes multiple roles by their IDs.
   * This method implements bulk soft delete for efficient batch operations.
   *
   * @param ids - Array of role IDs to delete
   * @returns Promise<number> - Number of roles successfully deleted
   *
   * Database Operations:
   * - Uses Prisma's updateMany for bulk update
   * - Sets deleted flag to true for all specified IDs
   * - Updates the updatedAt timestamp for all affected records
   *
   * Performance Considerations:
   * - Uses updateMany for efficient bulk operations
   * - Single database transaction for all updates
   *
   * Note: This method will not throw errors for non-existent IDs,
   * it will simply not update those records.
   */
  async bulkDelete(ids: number[]): Promise<number> {
    const result = await prisma.role.updateMany({
      where: {
        id: { in: ids },
        deleted: false, // Only delete non-deleted roles
      },
      data: {
        deleted: true,
      },
    });

    return result.count;
  }

  /**
   * Searches for roles with optional filtering and pagination.
   * This method provides flexible search capabilities for finding roles.
   *
   * @param params - Combined pagination and search parameters
   * @returns Promise<PaginatedResponse<Role>> - Paginated search results
   *
   * Search Features:
   * - Name-based search using case-insensitive contains
   * - Active/inactive filtering
   * - Pagination support
   * - Alphabetical ordering
   *
   * Database Operations:
   * - Uses Prisma's findMany with complex where conditions
   * - Implements efficient search with proper indexing
   * - Parallel execution of data and count queries
   */
  async search(
    params: PaginationParams & RoleSearchParams,
  ): Promise<PaginatedResponse<Role>> {
    const { page, limit, search, active } = params;
    const skip = (page - 1) * limit;

    // Build search conditions
    const whereConditions: any = {
      deleted: false, // Always exclude deleted roles
    };

    // Add search term if provided
    if (search) {
      whereConditions.name = {
        contains: search,
        mode: "insensitive", // Case-insensitive search
      };
    }

    // Add active filter if provided
    if (active !== undefined) {
      whereConditions.active = active;
    }

    // Execute search and count in parallel
    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: whereConditions,
        orderBy: { name: "asc" },
        skip,
        take: limit,
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      }),
      prisma.role.count({
        where: whereConditions,
      }),
    ]);

    return createPaginatedResponse(roles, total, { page, limit });
  }
}

// Export a singleton instance of the repository
export default new RoleRepository();
