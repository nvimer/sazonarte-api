import { Permission } from "@prisma/client";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionSearchParams,
} from "../permission.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

/**
 * Permission Repository Interface
 *
 */
export interface PermissionRepositoryInterface {
  /**
   * Retrieves all non-deleted permissions with pagination
   * Database Operations:
   * - Executes SELECT query with WHERE deleted = false
   * - Applies ORDER BY name ASC for consistent sorting
   * - Uses LIMIT and OFFSET for pagination
   * - Performs COUNT query for total records
   *
   * Performance Considerations:
   * - Uses indexed columns for filtering and sorting
   * - Implements efficient pagination with skip/take
   * - Parallel execution of data and count queries
   */
  findAll(params: PaginationParams): Promise<PaginatedResponse<Permission>>;

  /**
   * Finds a permission by its unique ID
   
   * Database Operations:
   * - Executes SELECT query with WHERE id = ?
   * - Uses primary key index for optimal performance
   * - Returns null for non-existent records
   */
  findById(id: number): Promise<Permission | null>;

  /**
   * Finds a permission by name (case-insensitive search)
   */
  findByName(name: string): Promise<Permission | null>;

  /**
   * Creates a new permission record
   */
  create(data: CreatePermissionInput): Promise<Permission>;

  /**
   * Updates an existing permission record
   */
  update(id: number, data: UpdatePermissionInput): Promise<Permission>;

  /**
   * Soft deletes a permission by setting deleted flag
   */
  delete(id: number): Promise<Permission>;

  /**
   * Bulk soft deletes multiple permissions
   */
  bulkDelete(ids: number[]): Promise<number>;

  /**
   * Searches permissions with filtering and pagination
   */
  search(
    params: PaginationParams & PermissionSearchParams,
  ): Promise<PaginatedResponse<Permission>>;
}
