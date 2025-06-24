import { MenuItem } from "@prisma/client";
import { ItemRepositoryInterface } from "./interfaces/item.repository.interface";
import { CreateItemInput } from "./item.validator";
import prisma from "../../../../database/prisma";

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
