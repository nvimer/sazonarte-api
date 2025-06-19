import { MenuCategory } from "@prisma/client";
import {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
  CategorySearchParams,
  BulkCategoryInput,
} from "./category.validator";
import { CategoryServiceInterface } from "./interfaces/category.service.interface";
import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";
import categoryRepository from "./category.repository";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";
import { CustomError } from "../../../../types/custom-errors";
import { HttpStatus } from "../../../../utils/httpStatus.enum";

/**
 * Service class responsible for business logic related to menu categories.
 * Acts as an intermediary between the controller and repository layers,
 * handling validation, error management, and business rules.
 *
 * This service implements the CategoryServiceInterface and follows
 * the dependency injection pattern for better testability.
 */
class CategoryService implements CategoryServiceInterface {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}

  /**
   * Private helper method to find a category by ID and throw an error if not found.
   * This method centralizes the "find or fail" logic to avoid code duplication.
   *
   * @param id - The unique identifier of the category to find
   * @returns Promise<MenuCategory> - The found category
   *
   * @throws CustomError with HTTP 404 status if category is not found
   *
   * This method is used internally by other service methods that need
   * to ensure a category exists before performing operations on it.
   */
  private async findCategoryByIdOrFail(id: number): Promise<MenuCategory> {
    // Attempt to find the category in the repository
    const menuCategory = await this.categoryRepository.findById(id);

    // If category doesn't exist, throw a custom error with appropriate details
    if (!menuCategory)
      throw new CustomError(
        `Menu Category ID ${id} not found`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );

    return menuCategory;
  }

  /**
   * Private helper method to check for duplicate category names.
   * This method ensures unique category names across the system.
   *
   * @param name - The category name to check
   * @param excludeId - Optional category ID to exclude from duplicate check (for updates)
   * @throws CustomError with HTTP 409 status if duplicate name found
   */
  private async checkDuplicateName(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const existingCategory = await this.categoryRepository.findByName(name);

    if (existingCategory && existingCategory.id !== excludeId) {
      throw new CustomError(
        `Category with name "${name}" already exists`,
        HttpStatus.CONFLICT,
        "DUPLICATE_NAME",
      );
    }
  }

  /**
   * Retrieves a paginated list of all menu categories.
   * This method handles the business logic for fetching categories with pagination support.
   *
   * @param params - Pagination parameters containing page and limit information
   * @returns Promise<PaginatedResponse<MenuCategory>> - Paginated response with categories
   *
   * The response includes:
   * - data: Array of MenuCategory objects
   * - pagination: Metadata about the pagination (total, page, limit, etc.)
   *
   * This method delegates the actual data fetching to the repository layer
   * while providing a clean interface for the controller.
   */
  async findCategories(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuCategory>> {
    // Delegate to repository layer for data fetching with pagination
    return await this.categoryRepository.findAll(params);
  }

  /**
   * Retrieves a specific menu category by its ID.
   * This method ensures the category exists before returning it.
   *
   * @param id - The unique identifier of the category to retrieve
   * @returns Promise<MenuCategory> - The found category object
   *
   * @throws CustomError with HTTP 404 status if category is not found
   *
   * This method uses the private findCategoryByIdOrFail helper to ensure
   * consistent error handling across the service.
   */
  async findCategoryById(id: number): Promise<MenuCategory> {
    // Use the private helper method to find category or throw error if not found
    return await this.findCategoryByIdOrFail(id);
  }

  /**
   * Creates a new menu category.
   * This method handles the business logic for category creation.
   *
   * @param data - Validated category creation data (CreateMenuCategoryInput)
   * @returns Promise<MenuCategory> - The newly created category object
   *
   * @throws CustomError with HTTP 409 status if category with same name already exists
   *
   * Business Logic:
   * 1. Check for duplicate category names
   * 2. Create the category if name is unique
   * 3. Return the created category
   */
  async createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    // Check for duplicate category names before creation
    await this.checkDuplicateName(data.name);

    // Delegate to repository layer for category creation
    return await this.categoryRepository.create(data);
  }

  /**
   * Updates an existing menu category.
   * This method ensures the category exists before attempting to update it.
   *
   * @param id - The unique identifier of the category to update
   * @param data - Validated category update data (UpdateMenuCategoryInput)
   * @returns Promise<MenuCategory> - The updated category object
   *
   * @throws CustomError with HTTP 404 status if category is not found
   * @throws CustomError with HTTP 409 status if update would create duplicate name
   *
   * Business Logic:
   * 1. First verifies the category exists using findCategoryByIdOrFail
   * 2. Check for duplicate names if name is being updated
   * 3. If category exists and no conflicts, proceeds with the update
   * 4. Returns the updated category data
   *
   * This two-step process ensures we don't attempt updates on non-existent categories
   * and provides clear error messages to the client.
   */
  async updateCategory(
    id: number,
    data: UpdateMenuCategoryInput,
  ): Promise<MenuCategory> {
    // First, verify the category exists (this will throw if not found)
    await this.findCategoryByIdOrFail(id);

    // Check for duplicate names if name is being updated
    if (data.name) {
      await this.checkDuplicateName(data.name, id);
    }

    // If category exists and no conflicts, proceed with the update
    return this.categoryRepository.update(id, data);
  }

  /**
   * Soft deletes a menu category.
   * This method implements soft delete to preserve data integrity.
   *
   * @param id - The unique identifier of the category to delete
   * @returns Promise<MenuCategory> - The soft-deleted category object
   *
   * @throws CustomError with HTTP 404 status if category is not found
   *
   * Business Logic:
   * 1. Verify the category exists
   * 2. Check if category is already deleted
   * 3. Perform soft delete operation
   * 4. Return the deleted category
   */
  async deleteCategory(id: number): Promise<MenuCategory> {
    // Verify the category exists
    const category = await this.findCategoryByIdOrFail(id);

    // Check if category is already deleted
    if (category.deleted) {
      throw new CustomError(
        `Menu Category ID ${id} is already deleted`,
        HttpStatus.BAD_REQUEST,
        "ALREADY_DELETED",
      );
    }

    // Perform soft delete
    return await this.categoryRepository.delete(id);
  }

  /**
   * Soft deletes multiple menu categories in bulk.
   * This method provides efficient batch deletion capabilities.
   *
   * @param data - Object containing array of category IDs to delete
   * @returns Promise<number> - Number of categories successfully deleted
   *
   * @throws CustomError with HTTP 400 status if no valid IDs provided
   *
   * Business Logic:
   * 1. Validate that at least one ID is provided
   * 2. Perform bulk soft delete operation
   * 3. Return count of successfully deleted categories
   */
  async bulkDeleteCategories(data: BulkCategoryInput): Promise<number> {
    // Validate that at least one ID is provided
    if (!data.ids || data.ids.length === 0) {
      throw new CustomError(
        "At least one category ID must be provided for bulk deletion",
        HttpStatus.BAD_REQUEST,
        "INVALID_INPUT",
      );
    }

    // Perform bulk soft delete
    return await this.categoryRepository.bulkDelete(data.ids);
  }

  /**
   * Searches for menu categories with optional filtering and pagination.
   * This method provides flexible search capabilities for finding categories.
   *
   * @param params - Combined pagination and search parameters
   * @returns Promise<PaginatedResponse<MenuCategory>> - Paginated search results
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
  async searchCategories(
    params: PaginationParams & CategorySearchParams,
  ): Promise<PaginatedResponse<MenuCategory>> {
    // Delegate to repository layer for search functionality
    return await this.categoryRepository.search(params);
  }
}

// Export a singleton instance of the service with injected repository dependency
export default new CategoryService(categoryRepository);
