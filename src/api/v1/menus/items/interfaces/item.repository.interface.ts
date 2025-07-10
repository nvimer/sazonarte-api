import { MenuItem } from "@prisma/client";
import { CreateItemInput } from "../item.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../../interfaces/pagination.interfaces";

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
  findAll(params: PaginationParams): Promise<PaginatedResponse<MenuItem>>;
  findById(id: number): Promise<MenuItem | null>;
  create(data: CreateItemInput): Promise<MenuItem>;
}
