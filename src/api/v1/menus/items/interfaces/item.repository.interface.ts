import { MenuItem } from "@prisma/client";
import { CreateItemInput } from "../item.validator";

/**
 * Menu Item Repository Interface
 *
 * Defines the contract for menu item repository implementations.
 * This interface ensures consistency across different menu item repository
 * implementations and provides clear documentation of expected methods.
 *
 * The interface defines core menu item persistence operations:
 * - Menu item data storage and retrieval
 * - Menu item lifecycle management
 * - Database interaction for menu items
 * - Data integrity maintenance
 *
 * Data Operations:
 * - CRUD operations for menu item entities
 * - Category association management
 * - Data validation and integrity
 * - Error handling for database operations
 */
export interface ItemRepositoryInterface {
  /**
   * Creates a new menu item record in the database.
   *
   * This method should:
   * - Insert data with proper validation
   * - Handle automatic ID generation
   * - Set creation timestamps
   * - Return complete created record
   * - Maintain referential integrity
   * - Handle database constraints
   */
  create(data: CreateItemInput): Promise<MenuItem>;
}
