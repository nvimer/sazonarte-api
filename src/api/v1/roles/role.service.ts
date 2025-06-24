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
