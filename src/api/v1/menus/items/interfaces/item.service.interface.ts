import { MenuItem } from "@prisma/client";
import { CreateItemInput } from "../item.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../../interfaces/pagination.interfaces";

/**
 * Menu Item Service Interface
 *
 * Defines the contract for menu item service implementations.
 * This interface ensures consistency across different menu item service
 * implementations and provides clear documentation of expected methods.
 *
 * The interface defines core menu item management operations:
 * - Menu item creation and validation
 * - Category association management
 * - Pricing and availability logic
 * - Data validation and transformation
 *
 * Business Operations:
 * - Menu item lifecycle management
 * - Category association verification
 * - Price and availability control
 * - Data validation and business rules
 */
export interface ItemServiceInteface {
  findAllMenuItems(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuItem>>;
  createItem(data: CreateItemInput): Promise<MenuItem>;
}
