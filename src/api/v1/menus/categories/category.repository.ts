import { MenuCategory } from "@prisma/client";
import {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
  CategorySearchParams,
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
 */
class CategoryRepository implements CategoryRepositoryInterface {
  /**
   * Retrieves a paginated list of all non-deleted menu categories from the database.
   * This method implements efficient pagination by calculating skip/take values
   * and fetching both the data and total count in parallel.
   *
   * Database Operations:
   * - Uses Prisma's findMany with skip/take for pagination
   * - Filters out deleted categories (deleted: false)
   * - Orders results by display order (ascending), then alphabetically by name
   * - Fetches total count in parallel for pagination metadata
   *
   * Ordering:
   * - Primary sort: order field (ascending) - for manual display ordering
   * - Secondary sort: name field (ascending) - for categories with same order
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
        orderBy: { order: "asc", name: "asc" }, // Sort alphabetically by name
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
   * Database Operations:
   * - Uses Prisma's findUnique for efficient primary key lookup
   * - Returns null if no category exists with the given ID
   * - No filtering applied - returns category regardless of deleted status
   */
  async findById(id: number): Promise<MenuCategory | null> {
    // Use Prisma's findUnique for efficient primary key lookup
    return await prisma.menuCategory.findUnique({ where: { id } });
  }

  /**
   * Retrieves a menu category by its name.
   * This method is used for duplicate name checking during creation and updates.
   *
   * Database Operations:
   * - Uses Prisma's findFirst for name-based lookup
   * - Filters out deleted categories to avoid conflicts with soft-deleted records
   * - Case-insensitive search using contains
   */
  async findByName(name: string): Promise<MenuCategory | null> {
    return await prisma.menuCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case-insensitive search
        },
        deleted: false, // Only search non-deleted categories
      },
    });
  }

  /**
   * Creates a new menu category in the database.
   * This method accepts validated input data and creates a new record.
   *
   * Database Operations:
   * - Uses Prisma's create method to insert new record
   * - Returns the complete created object including auto-generated fields (id, timestamps)
   * - Prisma handles data validation and type safety
   *
   * Error Handling:
   * - Prisma will throw errors for constraint violations (e.g., unique name constraint)
   * - These errors are typically handled at the service layer
   */
  async create(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    // Create new category record using Prisma's create method
    return await prisma.menuCategory.create({ data });
  }

  /**
   * Updates an existing menu category in the database.
   * This method updates only the fields provided in the data parameter.
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
   */
  async update(
    id: number,
    data: UpdateMenuCategoryInput,
  ): Promise<MenuCategory> {
    // Update category record using Prisma's update method
    return await prisma.menuCategory.update({ where: { id }, data });
  }

  /**
   * Soft deletes a menu category by setting the deleted flag to true.
   * This method implements soft delete to preserve data integrity and allow recovery.
   *
   * Database Operations:
   * - Uses Prisma's update method to set deleted flag to true
   * - Updates the updatedAt timestamp automatically
   * - Returns the updated category object
   *
   * Error Handling:
   * - Prisma will throw errors if category with given ID doesn't exist
   * - These errors are typically handled at the service layer
   */
  async delete(id: number): Promise<MenuCategory> {
    return await prisma.menuCategory.update({
      where: { id },
      data: {
        deleted: true,
      },
    });
  }

  /**
   * Soft deletes multiple menu categories by their IDs.
   * This method implements bulk soft delete for efficient batch operations.
   *
   * Database Operations:
   * - Uses Prisma's updateMany for bulk update
   * - Sets deleted flag to true for all specified IDs
   * - Updates the updatedAt timestamp for all affected records
   */
  async bulkDelete(ids: number[]): Promise<number> {
    const result = await prisma.menuCategory.updateMany({
      where: {
        id: { in: ids },
        deleted: false, // Only delete non-deleted categories
      },
      data: {
        deleted: true,
      },
    });

    return result.count;
  }

  /**
   * Searches for menu categories with optional filtering and pagination.
   * This method provides flexible search capabilities for finding categories.
   *
   * Search Features:
   * - Name-based search using case-insensitive contains
   * - Active/inactive filtering
   * - Pagination support
   * - Ordered by display order (primary), then alphabetically (secondary)
   */
  async search(
    params: PaginationParams & CategorySearchParams,
  ): Promise<PaginatedResponse<MenuCategory>> {
    const { page, limit, search, active } = params;
    const skip = (page - 1) * limit;

    // Build search conditions
    const whereConditions: any = {
      deleted: false, // Always exclude deleted categories
    };

    // Add search term if provided
    if (search) {
      whereConditions.name = {
        contains: search,
        mode: "insensitive", // Case-insensitive search
      };
    }

    // Add active filter if provided
    if (active !== undefined) {
      whereConditions.active = active;
    }

    // Execute search and count in parallel
    const [menuCategories, total] = await Promise.all([
      prisma.menuCategory.findMany({
        where: whereConditions,
        orderBy: { order: "asc", name: "asc" },
        skip,
        take: limit,
      }),
      prisma.menuCategory.count({
        where: whereConditions,
      }),
    ]);

    return createPaginatedResponse(menuCategories, total, { page, limit });
  }
}

// Export a singleton instance of the repository
export default new CategoryRepository();
