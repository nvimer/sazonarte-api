import { RoleServiceInterface } from "./interfaces/role.service.interface";
import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleSearchParams,
  BulkRoleInput,
} from "./role.validator";
import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import roleRepository from "./role.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { Role } from "@prisma/client";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";

/**
 * Service class responsible for business logic related to roles.
 * Acts as an intermediary between the controller and repository layers,
 * handling validation, error management, and business rules.
 *
 * This service implements the RoleServiceInterface and follows
 * the dependency injection pattern for better testability.
 */
class RoleService implements RoleServiceInterface {
  constructor(private roleRepository: RoleRepositoryInterface) {}

  /**
   * Private helper method to find a role by ID and throw an error if not found.
   * This method centralizes the "find or fail" logic to avoid code duplication.
   *
   * @param id - The unique identifier of the role to find
   * @returns Promise<Role> - The found role
   *
   * @throws CustomError with HTTP 404 status if role is not found
   *
   * This method is used internally by other service methods that need
   * to ensure a role exists before performing operations on it.
   */
  private async findRoleByIdOrFail(id: number): Promise<Role> {
    // Attempt to find the role in the repository
    const role = await this.roleRepository.findById(id);

    // If role doesn't exist, throw a custom error with appropriate details
    if (!role)
      throw new CustomError(
        `Role with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );

    return role;
  }

  /**
   * Private helper method to check for duplicate role names.
   * This method ensures unique role names across the system.
   *
   * @param name - The role name to check
   * @param excludeId - Optional role ID to exclude from duplicate check (for updates)
   * @throws CustomError with HTTP 409 status if duplicate name found
   */
  private async checkDuplicateName(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const existingRole = await this.roleRepository.findByName(name);

    if (existingRole && existingRole.id !== excludeId) {
      throw new CustomError(
        `Role with name "${name}" already exists`,
        HttpStatus.CONFLICT,
        "DUPLICATE_NAME",
      );
    }
  }

  /**
   * Retrieves a paginated list of all roles.
   * This method handles the business logic for fetching roles with pagination support.
   *
   * @param params - Pagination parameters containing page and limit information
   * @returns Promise<PaginatedResponse<Role>> - Paginated response with roles
   *
   * The response includes:
   * - data: Array of Role objects with permissions
   * - pagination: Metadata about the pagination (total, page, limit, etc.)
   *
   * This method delegates the actual data fetching to the repository layer
   * while providing a clean interface for the controller.
   */
  async findAllRoles(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Role>> {
    // Delegate to repository layer for data fetching with pagination
    return await this.roleRepository.findAll(params);
  }

  /**
   * Retrieves a specific role by its ID.
   * This method ensures the role exists before returning it.
   *
   * @param id - The unique identifier of the role to retrieve
   * @returns Promise<Role> - The found role object with permissions
   *
   * @throws CustomError with HTTP 404 status if role is not found
   *
   * This method uses the private findRoleByIdOrFail helper to ensure
   * consistent error handling across the service.
   */
  async findRoleById(id: number): Promise<Role> {
    // Use the private helper method to find role or throw error if not found
    return await this.findRoleByIdOrFail(id);
  }

  /**
   * Creates a new role.
   * This method handles the business logic for role creation.
   *
   * @param data - Validated role creation data (CreateRoleInput)
   * @returns Promise<Role> - The newly created role object with permissions
   *
   * @throws CustomError with HTTP 409 status if role with same name already exists
   *
   * Business Logic:
   * 1. Check for duplicate role names
   * 2. Create the role with permissions if name is unique
   * 3. Return the created role with associated permissions
   */
  async createRole(data: CreateRoleInput): Promise<Role> {
    // Check for duplicate role names before creation
    await this.checkDuplicateName(data.name);

    // Delegate to repository layer for role creation
    return await this.roleRepository.create(data);
  }

  /**
   * Updates an existing role.
   * This method ensures the role exists before attempting to update it.
   *
   * @param id - The unique identifier of the role to update
   * @param data - Validated role update data (UpdateRoleInput)
   * @returns Promise<Role> - The updated role object with permissions
   *
   * @throws CustomError with HTTP 404 status if role is not found
   * @throws CustomError with HTTP 409 status if update would create duplicate name
   *
   * Business Logic:
   * 1. First verifies the role exists using findRoleByIdOrFail
   * 2. Check for duplicate names if name is being updated
   * 3. If role exists and no conflicts, proceeds with the update
   * 4. Returns the updated role data with permissions
   *
   * This two-step process ensures we don't attempt updates on non-existent roles
   * and provides clear error messages to the client.
   */
  async updateRole(id: number, data: UpdateRoleInput): Promise<Role> {
    // First, verify the role exists (this will throw if not found)
    await this.findRoleByIdOrFail(id);

    // Check for duplicate names if name is being updated
    if (data.name) {
      await this.checkDuplicateName(data.name, id);
    }

    // If role exists and no conflicts, proceed with the update
    return await this.roleRepository.update(id, data);
  }

  /**
   * Soft deletes a role.
   * This method implements soft delete to preserve data integrity.
   *
   * @param id - The unique identifier of the role to delete
   * @returns Promise<Role> - The soft-deleted role object
   *
   * @throws CustomError with HTTP 404 status if role is not found
   *
   * Business Logic:
   * 1. Verify the role exists
   * 2. Check if role is already deleted
   * 3. Perform soft delete operation
   * 4. Return the deleted role
   */
  async deleteRole(id: number): Promise<Role> {
    // Verify the role exists
    const role = await this.findRoleByIdOrFail(id);

    // Check if role is already deleted
    if (role.deleted) {
      throw new CustomError(
        `Role with ID ${id} is already deleted`,
        HttpStatus.BAD_REQUEST,
        "ALREADY_DELETED",
      );
    }

    // Perform soft delete
    return await this.roleRepository.delete(id);
  }

  /**
   * Soft deletes multiple roles in bulk.
   * This method provides efficient batch deletion capabilities.
   *
   * @param data - Object containing array of role IDs to delete
   * @returns Promise<number> - Number of roles successfully deleted
   *
   * @throws CustomError with HTTP 400 status if no valid IDs provided
   *
   * Business Logic:
   * 1. Validate that at least one ID is provided
   * 2. Perform bulk soft delete operation
   * 3. Return count of successfully deleted roles
   */
  async bulkDeleteRoles(data: BulkRoleInput): Promise<number> {
    // Validate that at least one ID is provided
    if (!data.ids || data.ids.length === 0) {
      throw new CustomError(
        "At least one role ID must be provided for bulk deletion",
        HttpStatus.BAD_REQUEST,
        "INVALID_INPUT",
      );
    }

    // Perform bulk soft delete
    return await this.roleRepository.bulkDelete(data.ids);
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
   * This method delegates to the repository layer while providing
   * a clean interface for the controller.
   */
  async searchRoles(
    params: PaginationParams & RoleSearchParams,
  ): Promise<PaginatedResponse<Role>> {
    // Delegate to repository layer for search functionality
    return await this.roleRepository.search(params);
  }
}

// Export a singleton instance of the service with injected repository dependency
export default new RoleService(roleRepository);
