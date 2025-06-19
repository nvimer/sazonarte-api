import { MenuCategory } from "@prisma/client";
import {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
} from "./category.validator";
import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";
import prisma from "../../../../database/prisma";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../../utils/pagination.helper";

/**
 * Repository class responsible for data access operations related to menu categories.
 * This is the lowest layer in the architecture that directly interacts with the database
 * through Prisma ORM. It handles all CRUD operations for the MenuCategory entity.
 *
 * The repository implements the CategoryRepositoryInterface and provides a clean
 * abstraction over the database operations, making the code more testable and maintainable.
 */
class CategoryRepository implements CategoryRepositoryInterface {
  /**
   * Retrieves a paginated list of all non-deleted menu categories from the database.
   * This method implements efficient pagination by calculating skip/take values
   * and fetching both the data and total count in parallel.
   *
   * @param params - Pagination parameters containing page and limit information
   * @returns Promise<PaginatedResponse<MenuCategory>> - Paginated response with categories and metadata
   *
   * Database Operations:
   * - Uses Prisma's findMany with skip/take for pagination
   * - Filters out deleted categories (deleted: false)
   * - Orders results alphabetically by name (ascending)
   * - Fetches total count in parallel for pagination metadata
   *
   * Performance Considerations:
   * - Uses Promise.all for concurrent execution of data and count queries
   * - Applies proper indexing through Prisma's query optimization
   */
  async findAll(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuCategory>> {
    // Extract pagination parameters
    const { page, limit } = params;

    // Calculate the number of records to skip for pagination
    const skip = (page - 1) * limit;

    // Execute data fetching and count queries in parallel for better performance
    const [menuCategories, total] = await Promise.all([
      // Fetch paginated categories with filtering and ordering
      prisma.menuCategory.findMany({
        where: { deleted: false }, // Only include non-deleted categories
        orderBy: { name: "asc" }, // Sort alphabetically by name
        skip, // Skip records for pagination
        take: limit, // Limit number of records returned
      }),
      // Get total count of non-deleted categories for pagination metadata
      prisma.menuCategory.count({
        where: { deleted: false },
      }),
    ]);

    // Create and return paginated response with data and metadata
    return createPaginatedResponse(menuCategories, total, params);
  }

  /**
   * Retrieves a specific menu category by its unique identifier.
   * This method uses Prisma's findUnique for optimal performance on primary key lookups.
   *
   * @param id - The unique identifier (primary key) of the category to find
   * @returns Promise<MenuCategory | null> - The found category or null if not found
   *
   * Database Operations:
   * - Uses Prisma's findUnique for efficient primary key lookup
   * - Returns null if no category exists with the given ID
   * - No filtering applied - returns category regardless of deleted status
   *
   * Note: This method doesn't filter by deleted status, allowing the service layer
   * to handle soft-deleted records as needed for business logic.
   */
  async findById(id: number): Promise<MenuCategory | null> {
    // Use Prisma's findUnique for efficient primary key lookup
    return await prisma.menuCategory.findUnique({ where: { id } });
  }

  /**
   * Creates a new menu category in the database.
   * This method accepts validated input data and creates a new record.
   *
   * @param data - Validated category creation data (CreateMenuCategoryInput)
   * @returns Promise<MenuCategory> - The newly created category with generated fields
   *
   * Database Operations:
   * - Uses Prisma's create method to insert new record
   * - Returns the complete created object including auto-generated fields (id, timestamps)
   * - Prisma handles data validation and type safety
   *
   * Error Handling:
   * - Prisma will throw errors for constraint violations (e.g., unique name constraint)
   * - These errors are typically handled at the service layer
   *
   * The input data is already validated by the validator layer, ensuring
   * data integrity before reaching the database.
   */
  async create(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    // Create new category record using Prisma's create method
    return await prisma.menuCategory.create({ data });
  }

  /**
   * Updates an existing menu category in the database.
   * This method updates only the fields provided in the data parameter.
   *
   * @param id - The unique identifier of the category to update
   * @param data - Validated category update data (UpdateMenuCategoryInput)
   * @returns Promise<MenuCategory> - The updated category object
   *
   * Database Operations:
   * - Uses Prisma's update method for partial updates
   * - Only updates fields provided in the data parameter
   * - Returns the complete updated object
   *
   * Error Handling:
   * - Prisma will throw errors if category with given ID doesn't exist
   * - Prisma will throw errors for constraint violations (e.g., unique name constraint)
   * - These errors are typically handled at the service layer
   *
   * Note: This method assumes the category exists. The service layer should
   * verify existence before calling this method to provide better error messages.
   */
  async update(
    id: number,
    data: UpdateMenuCategoryInput,
  ): Promise<MenuCategory> {
    // Update category record using Prisma's update method
    return await prisma.menuCategory.update({ where: { id }, data });
  }
}

// Export a singleton instance of the repository
export default new CategoryRepository();
