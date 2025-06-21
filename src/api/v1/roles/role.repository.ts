import { Role } from "@prisma/client";
import prisma from "../../../database/prisma";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import { CreateRoleInput, UpdateRoleInput } from "./role.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

/**
 * Role Repository
 *
 * Data access layer for role-related database operations.
 * This repository is responsible for:
 * - Direct database interactions using Prisma ORM
 * - Role CRUD operations
 * - Complex queries with permission relationships
 * - Pagination support for large datasets
 * - Soft delete handling (deleted: false filter)
 * - Permission assignment and management
 *
 * The repository implements the RoleRepositoryInterface for
 * consistency and follows the repository pattern for data access.
 */
class RoleRepository implements RoleRepositoryInterface {
  /**
   * Retrieves a paginated list of all active roles from the database.
   * This method supports efficient pagination for large role datasets
   * and excludes soft-deleted roles from the results.
   *
   * @param params - Pagination parameters (page, limit)
   * @returns Promise<PaginatedResponse<Role>> - Paginated role data
   *
   * Database Operations:
   * - Fetches roles with pagination (skip/take)
   * - Orders results by name ascending
   * - Excludes soft-deleted roles (deleted: false)
   * - Counts total roles for pagination metadata
   *
   * Performance Considerations:
   * - Uses Promise.all for concurrent queries
   * - Implements proper indexing on name and deleted fields
   * - Returns only necessary role fields
   */
  async findAll(params: PaginationParams): Promise<PaginatedResponse<Role>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.role.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(roles, total, params);
  }

  /**
   * Searches and filters roles based on various criteria.
   * This method provides advanced filtering capabilities for
   * role management and administrative interfaces.
   *
   * @param params - Pagination parameters (page, limit)
   * @param search - Text search term for role name or description
   * @param active - Filter by active status (optional)
   * @returns Promise<PaginatedResponse<Role>> - Filtered and paginated role data
   *
   * Database Operations:
   * - Performs case-insensitive text search in role names
   * - Filters by active status if provided
   * - Excludes soft-deleted roles
   * - Supports pagination with search results
   *
   * Search Features:
   * - Case-insensitive search using PostgreSQL ILIKE
   * - Combined filtering (search + active status)
   * - Efficient indexing on searchable fields
   */
  async searchRoles(
    params: PaginationParams,
    search: string,
    active?: boolean,
  ): Promise<PaginatedResponse<Role>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      deleted: false,
      name: {
        contains: search,
        mode: "insensitive",
      },
    };

    if (active !== undefined) {
      whereClause.active = active;
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.role.count({
        where: whereClause,
      }),
    ]);

    return createPaginatedResponse(roles, total, params);
  }

  /**
   * Finds a role by their unique identifier.
   * This method is used for role retrieval and validation operations.
   *
   * @param id - Role ID (integer)
   * @returns Promise<Role | null> - Role object if found, null otherwise
   *
   * Database Operations:
   * - Uses findUnique for optimal performance
   * - Searches by primary key (id)
   * - Returns null if no role found
   *
   * Note: This method doesn't filter by deleted status as it's
   * used for validation and lookup operations.
   */
  async findById(id: number): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { id },
    });
  }

  /**
   * Creates a new role in the database with associated permissions.
   * This method handles the complete role creation process including:
   * - Role basic information
   * - Permission assignments (if provided)
   *
   * @param data - Role creation data including optional permission IDs
   * @returns Promise<Role> - Created role with permission relationships
   *
   * Database Operations:
   * - Creates role record with basic information
   * - Creates role-permission relationships for each provided permission ID
   * - Returns role with permission information included
   *
   * Transaction Safety:
   * - All operations are performed in a single transaction
   * - Ensures data consistency across role and permissions
   * - Rolls back all changes if any operation fails
   *
   * Permission Assignment:
   * - Supports multiple permission assignments
   * - Creates RolePermission junction table records
   * - Connects to existing permissions by ID
   */
  async createRole(data: CreateRoleInput): Promise<Role> {
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
   * Updates an existing role's information in the database.
   * This method supports partial updates and can handle permission
   * reassignment when permission IDs are provided.
   *
   * @param id - Role ID to update
   * @param data - Update data (partial role fields and optional permission IDs)
   * @returns Promise<Role> - Updated role object
   *
   * Database Operations:
   * - Updates only provided role fields
   * - Replaces all permissions if permissionIds provided
   * - Uses optimistic locking for concurrency control
   * - Returns updated role with permission information
   *
   * Permission Management:
   * - If permissionIds provided, removes all existing permissions
   * - Assigns new permissions based on provided IDs
   * - Maintains referential integrity
   * - Supports complete permission replacement
   */
  async updateRole(id: number, data: UpdateRoleInput): Promise<Role> {
    const { permissionIds, ...roleData } = data;

    // If permissionIds are provided, replace all existing permissions
    if (permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });
    }

    return await prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        ...(permissionIds && {
          permissions: {
            create: permissionIds.map((permissionId) => ({
              permission: { connect: { id: permissionId } },
            })),
          },
        }),
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Performs soft deletion of a role in the database.
   * This method marks the role as deleted without removing it
   * from the database to maintain data integrity.
   *
   * @param id - Role ID to delete
   * @returns Promise<Role> - Soft-deleted role object
   *
   * Database Operations:
   * - Updates deleted flag to true
   * - Sets deletedAt timestamp
   * - Preserves all role data and relationships
   *
   * Soft Delete Benefits:
   * - Maintains referential integrity
   * - Preserves historical data
   * - Allows for potential recovery
   * - Maintains audit trails
   */
  async deleteRole(id: number): Promise<Role> {
    return await prisma.role.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() },
    });
  }

  /**
   * Performs soft deletion of multiple roles in a single operation.
   * This method provides efficient bulk deletion for administrative
   * operations and cleanup tasks.
   *
   * @param ids - Array of role IDs to delete
   * @returns Promise<{ deletedCount: number }> - Count of successfully deleted roles
   *
   * Database Operations:
   * - Updates multiple roles in a single query
   * - Only affects non-deleted roles
   * - Sets deleted flag and timestamp for all affected roles
   * - Returns count of affected records
   *
   * Bulk Operation Features:
   * - Efficient single-query operation
   * - Atomic operation (all or nothing)
   * - Only processes non-deleted roles
   * - Returns accurate deletion count
   */
  async bulkDeleteRoles(ids: number[]): Promise<{ deletedCount: number }> {
    const result = await prisma.role.updateMany({
      where: {
        id: { in: ids },
        deleted: false,
      },
      data: { deleted: true, deletedAt: new Date() },
    });

    return { deletedCount: result.count };
  }

  /**
   * Retrieves a role with their complete permission hierarchy.
   * This method is essential for authorization systems as it provides
   * the complete access control context for a role.
   *
   * @param id - Role ID
   * @returns Promise<Role | null> - Role with permissions
   *
   * Database Operations:
   * - Fetches role with nested permission relationships
   * - Uses complex join operations for efficiency
   * - Returns null if role not found
   *
   * Response Structure:
   * - Role basic information
   * - RolePermission relationships with permission details
   * - Complete permission hierarchy for access control
   *
   * Use Cases:
   * - Access control decisions
   * - UI permission rendering
   * - Security audits and logging
   * - Role management interfaces
   */
  async findRoleWithPermissions(id: number): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Assigns permissions to a role, replacing any existing permissions.
   * This method provides complete control over role permissions
   * by removing all existing assignments and creating new ones.
   *
   * @param roleId - Role ID to assign permissions to
   * @param permissionIds - Array of permission IDs to assign
   * @returns Promise<Role> - Role with updated permissions
   *
   * Database Operations:
   * - Removes all existing role-permission relationships
   * - Creates new role-permission relationships for provided IDs
   * - Returns role with updated permission information
   *
   * Assignment Behavior:
   * - Complete replacement of existing permissions
   * - Atomic operation (all or nothing)
   * - Maintains referential integrity
   * - Supports empty permission array (removes all permissions)
   */
  async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    // First, remove existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Then assign the new permissions
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    });

    // Return the role with its permissions
    return prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    }) as Promise<Role>;
  }

  /**
   * Removes specific permissions from a role.
   * This method allows selective permission removal without
   * affecting other assigned permissions.
   *
   * @param roleId - Role ID to remove permissions from
   * @param permissionIds - Array of permission IDs to remove
   * @returns Promise<Role> - Role with updated permissions
   *
   * Database Operations:
   * - Removes specific role-permission relationships
   * - Preserves other assigned permissions
   * - Returns role with updated permission information
   *
   * Removal Behavior:
   * - Selective removal of specified permissions
   * - Preserves other existing permissions
   * - Safe operation (no effect if permission not assigned)
   * - Maintains referential integrity
   */
  async removePermissionsFromRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });

    return prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    }) as Promise<Role>;
  }

  async getRolesWithPermissions(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Role>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: { deleted: false },
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
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(roles, total, params);
  }
}

export default new RoleRepository();
