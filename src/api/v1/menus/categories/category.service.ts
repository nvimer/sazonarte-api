import { MenuCategory } from "@prisma/client";
import {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
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
   * (This error is typically thrown by the repository layer)
   *
   * The input data is already validated by the controller layer through
   * the category validator, so this method can safely delegate to the repository.
   */
  async createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory> {
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
   * 2. If category exists, proceeds with the update
   * 3. Returns the updated category data
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

    // If category exists, proceed with the update
    return this.categoryRepository.update(id, data);
  }
}

// Export a singleton instance of the service with injected repository dependency
export default new CategoryService(categoryRepository);
