import { MenuItem } from "@prisma/client";
import { CreateItemInput } from "../item.validator";

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
  /**
   * Creates a new menu item in the system with the provided information.
   *
   * This method should:
   * - Validate input data and business rules
   * - Check for name conflicts within category
   * - Verify category existence and status
   * - Set appropriate default values
   * - Ensure data consistency
   * - Handle validation errors appropriately
   */
  createItem(data: CreateItemInput): Promise<MenuItem>;
}
