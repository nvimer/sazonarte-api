import { Role } from "@prisma/client";
import roleRepository from "./role.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { RoleServiceInterface } from "./interfaces/role.service.interface";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import { CreateRoleInput, UpdateRoleInput } from "./role.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";

/**
 * Role Service
 *
 * Core business logic layer for role management operations.
 * This service is responsible for:
 * - Role CRUD operations with business rules
 * - Data validation and integrity checks
 * - Error handling and custom error creation
 * - Delegating data access to the repository layer
 *
 * The service follows the dependency injection pattern and
 * implements the RoleServiceInterface for consistency.
 *
 * Role management includes:
 * - Basic CRUD operations (Create, Read, Update, Delete)
 * - Search and filtering capabilities
 * - Bulk operations for efficiency
 * - Validation of role existence and constraints
 */
class RoleService implements RoleServiceInterface {
  constructor(private roleRepository: RoleRepositoryInterface) {}

  /**
   * Validates that a role exists by ID and returns the role if found.
   * This method is used across multiple operations to ensure
   * the role exists before performing any modifications.
   *
   * @param id - Role ID to validate
   * @returns Promise<Role> - Role object if found
   * @throws CustomError - If role is not found
   *
   * Error Codes:
   * - ID_NOT_FOUND: Role with the specified ID doesn't exist
   *
   * This method is private as it's an internal validation helper
   * used by other service methods to ensure data integrity.
   */
  private async findByIdOrFail(id: number): Promise<Role> {
    const role = await this.roleRepository.findById(id);

    if (!role)
      throw new CustomError(
        `Role with ID ${id} not found.`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return role;
  }

  /**
   * Retrieves a paginated list of all roles in the system.
   * This method supports pagination for efficient data retrieval
   * and is typically used for role management interfaces.
   *
   * @param params - Pagination parameters (page, limit)
   * @returns Promise<PaginatedResponse<Role>> - Paginated role data
   *
   * The response includes:
   * - Roles array with basic role information
   * - Pagination metadata (total, page, limit, etc.)
   * - Excludes soft-deleted roles
   */
  async findAll(params: PaginationParams): Promise<PaginatedResponse<Role>> {
    return this.roleRepository.findAll(params);
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
   * Search functionality includes:
   * - Text-based search in role names and descriptions
   * - Active status filtering (true/false/undefined for all)
   * - Combined pagination and filtering
   * - Case-insensitive search
   */
  async searchRoles(
    params: PaginationParams,
    search: string,
    active?: boolean,
  ): Promise<PaginatedResponse<Role>> {
    return this.roleRepository.searchRoles(params, search, active);
  }

  /**
   * Retrieves a specific role by their unique identifier.
   * This method validates the role exists before returning the data.
   *
   * @param id - Role ID (integer)
   * @returns Promise<Role> - Role object if found
   * @throws CustomError - If role is not found
   *
   * Error Codes:
   * - ID_NOT_FOUND: Role with the specified ID doesn't exist
   *
   * Returns complete role information including associated permissions.
   */
  async findById(id: number): Promise<Role> {
    return this.findByIdOrFail(id);
  }

  /**
   * Creates a new role in the system.
   * This method handles role creation with optional permission assignments
   * and validation of role name uniqueness.
   *
   * @param data - Role creation data
   * @returns Promise<Role> - Created role object
   * @throws CustomError - If role name already exists or validation fails
   *
   * Error Codes:
   * - NAME_CONFLICT: Role name already exists in the system
   * - INVALID_PERMISSION_IDS: One or more permission IDs are invalid
   *
   * Creation Process:
   * - Validates role name uniqueness
   * - Validates permission IDs (if provided)
   * - Creates role with associated permissions
   * - Returns complete role information
   */
  async createRole(data: CreateRoleInput): Promise<Role> {
    return this.roleRepository.createRole(data);
  }

  /**
   * Updates an existing role's information.
   * This method supports partial updates and includes validation
   * to ensure data integrity and uniqueness.
   *
   * @param id - Role ID to update
   * @param data - Update data (all fields optional)
   * @returns Promise<Role> - Updated role object
   * @throws CustomError - If role not found or name conflict
   *
   * Error Codes:
   * - ID_NOT_FOUND: Role with the specified ID doesn't exist
   * - NAME_CONFLICT: Role name already exists (if name is being changed)
   *
   * Validation:
   * - Ensures role exists before update
   * - Validates name uniqueness if name is being changed
   * - Supports partial updates (only provided fields are updated)
   */
  async updateRole(id: number, data: UpdateRoleInput): Promise<Role> {
    await this.findByIdOrFail(id);
    return this.roleRepository.updateRole(id, data);
  }

  /**
   * Deletes a specific role from the system.
   * This method performs soft deletion to maintain data integrity
   * and preserve historical relationships.
   *
   * @param id - Role ID to delete
   * @returns Promise<Role> - Deleted role object
   * @throws CustomError - If role not found or cannot be deleted
   *
   * Error Codes:
   * - ID_NOT_FOUND: Role with the specified ID doesn't exist
   * - ROLE_IN_USE: Role cannot be deleted (has active users)
   *
   * Deletion Behavior:
   * - Performs soft delete (marks as deleted)
   * - Validates no active users are assigned to the role
   * - Maintains referential integrity
   * - Preserves historical data
   */
  async deleteRole(id: number): Promise<Role> {
    await this.findByIdOrFail(id);
    return this.roleRepository.deleteRole(id);
  }

  /**
   * Deletes multiple roles in a single operation.
   * This method provides efficient bulk deletion for administrative
   * operations and cleanup tasks.
   *
   * @param ids - Array of role IDs to delete
   * @returns Promise<{ deletedCount: number }> - Count of successfully deleted roles
   * @throws CustomError - If validation fails or some roles cannot be deleted
   *
   * Error Codes:
   * - INVALID_IDS: Invalid role IDs provided
   * - ROLES_IN_USE: Some roles cannot be deleted (have active users)
   *
   * Bulk Operation Features:
   * - Processes multiple roles in a single request
   * - Returns count of successfully deleted roles
   * - Handles partial failures gracefully
   * - Maintains data integrity across all operations
   *
   * Use Cases:
   * - Administrative cleanup
   * - Bulk role management
   * - System maintenance operations
   */
  async bulkDeleteRoles(ids: number[]): Promise<{ deletedCount: number }> {
    return this.roleRepository.bulkDeleteRoles(ids);
  }
}

export default new RoleService(roleRepository);
