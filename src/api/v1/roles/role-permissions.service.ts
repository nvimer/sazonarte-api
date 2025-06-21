import { Role } from "@prisma/client";
import roleRepository from "./role.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { RolePermissionServiceInterface } from "./interfaces/role-permissions.service.interface";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";

/**
 * Role Permission Service
 *
 * Core business logic layer for role permission management operations.
 * This service is responsible for:
 * - Role permission assignment and removal with business rules
 * - Data validation and integrity checks
 * - Error handling and custom error creation
 * - Delegating data access to the role repository
 *
 * The service follows the dependency injection pattern and
 * implements the RolePermissionServiceInterface for consistency.
 *
 * Role permission management includes:
 * - Retrieving roles with their associated permissions
 * - Assigning permissions to roles (replacement strategy)
 * - Removing specific permissions from roles
 * - Paginated listing of roles with permissions
 * - Validation of role and permission existence
 */
class RolePermissionService implements RolePermissionServiceInterface {
  constructor(private roleRepository: RoleRepositoryInterface) {}

  /**
   * Validates that a role exists with permissions and returns the role if found.
   * This method is used across multiple operations to ensure
   * the role exists before performing any permission modifications.
   *
   * @param id - Role ID to validate
   * @returns Promise<Role> - Role object with permissions if found
   * @throws CustomError - If role is not found
   *
   * Error Codes:
   * - ID_NOT_FOUND: Role with the specified ID doesn't exist
   *
   * This method is private as it's an internal validation helper
   * used by other service methods to ensure data integrity.
   */
  private async findRoleWithPermissionsOrFail(id: number): Promise<Role> {
    const role = await this.roleRepository.findRoleWithPermissions(id);

    if (!role)
      throw new CustomError(
        `Role with ID ${id} not found.`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return role;
  }

  /**
   * Retrieves a specific role with all its associated permissions.
   * This method validates the role exists before returning the data.
   *
   * @param id - Role ID (integer)
   * @returns Promise<Role> - Role object with permissions if found
   * @throws CustomError - If role is not found
   *
   * Error Codes:
   * - ID_NOT_FOUND: Role with the specified ID doesn't exist
   *
   * Returns complete role information including all associated permissions.
   * This method is commonly used for:
   * - Role editing interfaces
   * - Permission auditing and review
   * - Access control verification
   */
  async findRoleWithPermissions(id: number): Promise<Role> {
    return this.findRoleWithPermissionsOrFail(id);
  }

  /**
   * Assigns permissions to a specific role. This operation replaces
   * all existing permissions for the role with the new set provided.
   *
   * @param roleId - Role ID to assign permissions to
   * @param permissionIds - Array of permission IDs to assign
   * @returns Promise<Role> - Updated role with new permissions
   * @throws CustomError - If role not found or validation fails
   *
   * Error Codes:
   * - ID_NOT_FOUND: Role with the specified ID doesn't exist
   * - INVALID_PERMISSION_IDS: One or more permission IDs are invalid
   *
   * Assignment Behavior:
   * - Replaces all existing permissions with the new set
   * - Validates that all permission IDs exist
   * - Returns updated role with new permission assignments
   * - Maintains referential integrity
   *
   * Use Cases:
   * - Role permission management
   * - Access control configuration
   * - Permission auditing and updates
   */
  async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    await this.findRoleWithPermissionsOrFail(roleId);
    return this.roleRepository.assignPermissionsToRole(roleId, permissionIds);
  }

  /**
   * Removes specific permissions from a role. This operation only
   * removes the specified permissions, leaving other permissions intact.
   *
   * @param roleId - Role ID to remove permissions from
   * @param permissionIds - Array of permission IDs to remove
   * @returns Promise<Role> - Updated role with remaining permissions
   * @throws CustomError - If role not found
   *
   * Error Codes:
   * - ID_NOT_FOUND: Role with the specified ID doesn't exist
   *
   * Removal Behavior:
   * - Only removes the specified permissions
   * - Preserves other existing permissions
   * - Returns updated role with remaining permissions
   * - Safe operation (no effect if permission not assigned)
   *
   * Use Cases:
   * - Selective permission removal
   * - Access control refinement
   * - Permission cleanup and maintenance
   */
  async removePermissionsFromRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    await this.findRoleWithPermissionsOrFail(roleId);
    return this.roleRepository.removePermissionsFromRole(roleId, permissionIds);
  }

  /**
   * Retrieves a paginated list of all roles with their associated permissions.
   * This method supports pagination for efficient data retrieval
   * and is typically used for administrative interfaces.
   *
   * @param params - Pagination parameters (page, limit)
   * @returns Promise<PaginatedResponse<Role>> - Paginated roles with permissions data
   *
   * The response includes:
   * - Roles array with permission information
   * - Pagination metadata (total, page, limit, etc.)
   * - Excludes soft-deleted roles
   *
   * This data is typically used for:
   * - Administrative role management
   * - Permission auditing and review
   * - Access control overview
   * - Role-permission relationship analysis
   */
  async getRolesWithPermissions(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Role>> {
    return this.roleRepository.getRolesWithPermissions(params);
  }
}

export default new RolePermissionService(roleRepository);
