import { MenuItem } from "@prisma/client";
import { ItemRepositoryInterface } from "./interfaces/item.repository.interface";
import { CreateItemInput } from "./item.validator";
import prisma from "../../../../database/prisma";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../../utils/pagination.helper";

/**
 * Menu Item Repository
 *
 * Data access layer for menu item-related database operations.
 * This repository is responsible for:
 * - Menu item persistence and storage
 * - Menu item retrieval and querying
 * - Menu item lifecycle management
 * - Database interaction for menu item operations
 *
 * The repository follows the repository pattern and
 * implements the ItemRepositoryInterface for consistency.
 *
 * Database Operations:
 * - Menu item creation and storage
 * - Menu item retrieval and querying
 * - Menu item updates and modifications
 * - Menu item deletion and cleanup
 *
 * Data Integrity Features:
 * - Foreign key constraint validation
 * - Unique constraint enforcement
 * - Data consistency maintenance
 * - Error handling for database operations
 */
class ItemRepository implements ItemRepositoryInterface {
  /**
   * Retrieves a paginated list of all non-deleted menu-items from the database.
   * This method implements efficient pagination with proper skip/take
   * logic and total count calculation
   *
   * Query Features:
   * - Excludes soft-deleted menu-item (deleted: false)
   * - Implements proper pagination with skip/take
   * - Calculates total count for matadata
   * - Uses Promises.all for concurrent execution
   *
   * Use Cases:
   * - Restaurant dashboard display
   * - MenuItem management interface
   * - Data export and reporting
   * - Administratice overview
   */
  async findAll(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuItem>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: { deleted: false },
        skip,
        take: limit,
      }),
      prisma.menuItem.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(menuItems, total, params);
  }

  /*
   * Retrieves a specific menu item by its unique identifier.
   * This method uses Prisma's findUnique for optimal performance on primary key lookups.
   *
   * Database Operations:
   * - Uses Prisma's findUnique for efficient primary key lookup.
   * - Returns null if no menu item exists with the given ID
   * - No filtering applied - returns menu item regardless of deleted status
   */
  async findById(id: number): Promise<MenuItem | null> {
    return await prisma.menuItem.findUnique({ where: { id } });
  }

  /**
   * Creates a new menu item record in the database.
   * This method handles item creation with proper data validation
   * and ensures data integrity.
   *
   * Use Cases:
   * - Menu item addition
   * - New dish introduction
   * - Menu expansion
   * - Seasonal item creation
   * - Special offer items
   *
   * Integration:
   * - Uses Prisma ORM for database operations
   * - Follows repository pattern
   * - Implements interface contract
   * - Maintains data consistency
   */
  async create(data: CreateItemInput): Promise<MenuItem> {
    return await prisma.menuItem.create({ data });
  }
}

export default new ItemRepository();
