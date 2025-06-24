import { Role } from "@prisma/client";
import { PaginationParams, PaginatedResponse } from "../../../../interfaces/pagination.interfaces";

/**
 * Role Permission Service Interface
 * 
 * Defines the contract for role permission service implementations.
 * This interface ensures consistency across different role permission service
 * implementations and provides clear documentation of expected methods.
 * 
 * The interface defines core role permission management operations:
 * - Retrieving roles with their associated permissions
 * - Assigning permissions to roles (replacement strategy)
 * - Removing specific permissions from roles
 * - Paginated listing of roles with permissions
 * 
 * This interface is essential for:
 * - Dependency injection and testing
 * - Service layer consistency
 * - Clear API documentation
 * - Maintainable code architecture
 */
export interface RolePermissionServiceInterface {
  /**
   * Retrieves a specific role with all its associated permissions.
   * 
   * @param id - Role ID (integer)
   * @returns Promise<Role> - Role object with permissions if found
   * 
   * This method should:
   * - Validate the role exists before returning data
   * - Throw appropriate errors if role not found
   * - Return complete role information including all permissions
   * - Handle role ID validation and error cases
   */
  findRoleWithPermissions(id: number): Promise<Role>;

  /**
   * Assigns permissions to a specific role. This operation replaces
   * all existing permissions for the role with the new set provided.
   * 
   * @param roleId - Role ID to assign permissions to
   * @param permissionIds - Array of permission IDs to assign
   * @returns Promise<Role> - Updated role with new permissions
   * 
   * This method should:
   * - Validate role exists before assignment
   * - Replace all existing permissions with the new set
   * - Validate that all permission IDs exist
   * - Return updated role with new permission assignments
   * - Maintain referential integrity
   */
  assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<Role>;

  /**
   * Removes specific permissions from a role. This operation only
   * removes the specified permissions, leaving other permissions intact.
   * 
   * @param roleId - Role ID to remove permissions from
   * @param permissionIds - Array of permission IDs to remove
   * @returns Promise<Role> - Updated role with remaining permissions
   * 
   * This method should:
   * - Validate role exists before removal
   * - Only remove the specified permissions
   * - Preserve other existing permissions
   * - Return updated role with remaining permissions
   * - Handle safe removal (no effect if permission not assigned)
   */
  removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<Role>;

  /**
   * Retrieves a paginated list of all roles with their associated permissions.
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Promise<PaginatedResponse<Role>> - Paginated roles with permissions data
   * 
   * This method should:
   * - Support efficient pagination for large datasets
   * - Exclude soft-deleted roles from results
   * - Return roles with complete permission information
   * - Include pagination metadata (total, page, limit, etc.)
   * - Order results appropriately
   */
  getRolesWithPermissions(params: PaginationParams): Promise<PaginatedResponse<Role>>;
} 