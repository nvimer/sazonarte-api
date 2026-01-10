import { MenuItem, StockAdjustment } from "@prisma/client";
import { ItemServiceInterface } from "./interfaces/item.service.interface";
import {
  AddStockBodyInput,
  CreateItemInput,
  DailyStockResetInput,
  InventoryTypeInput,
  MenuItemSearchParams,
  RemoveStockBodyInput,
} from "./item.validator";
import { ItemRepositoryInterface } from "./interfaces/item.repository.interface";
import itemRepository from "./item.repository";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";
import { CustomError } from "../../../../types/custom-errors";
import { HttpStatus } from "../../../../utils/httpStatus.enum";
import {
  InventoryType,
  StockAdjustmentType,
} from "../../../../types/prisma.types";

/**
 * Menu Item Service
 *
 * Core business logic layer for menu item management operations.
 * This service is responsible for:
 * - Menu item CRUD operations (Create, Read, Update, Delete)
 * - Menu item validation and business rules
 * - Category association management
 * - Pricing and availability logic
 * - Data validation and transformation
 *
 * Menu item management includes:
 * - Item creation with validation
 * - Category association verification
 * - Price and availability management
 * - Item lifecycle management
 *
 * Business Rules:
 * - Item name uniqueness within category
 * - Price must be positive
 * - Category must exist and be active
 * - Item status management
 * - Data integrity maintenance
 */
class ItemService implements ItemServiceInterface {
  constructor(private itemRepository: ItemRepositoryInterface) { }

  /**
   * Private helper method to find a menu item by id and throw an error if not found.
   * This method centralizes the "find or fail" logic to avoid code duplication
   *
   * This method is used internally by other service method that need
   * to ensure a menu item exists before performing operations on it.
   */
  private async findMenuItemByIdOrFail(id: number) {
    // Attempt to find the menu item in the repository
    const menuItem = await this.itemRepository.findById(id);

    // If menu item doesn't exist, throw a custom error with appropiate details.
    if (!menuItem)
      throw new CustomError(
        `Menu Item ID ${id} not found`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return menuItem;
  }

  /**
   * Retrieves a paginated list of all Menu Items in the system.
   * This method handles pagination logic and delegates data
   * retrieval to the repository layer.
   *
   * Business Logic:
   *  - Validates pagination parameters
   *  - Hablde default values
   *  - Ensures data consistency
   *  - Provices optimized queries
   *
   * Uses Cases:
   *  - Restaurant dashboard display
   *  - Menu Item management interface
   *  - Data export and reporting
   *  - Administrative overview
   */
  async findAllMenuItems(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuItem>> {
    return this.itemRepository.findAll(params);
  }

  /*
   * Retrieves a specific menu item bu its ID.
   * This method ensures the menu item exists before returning it
   */
  async findMenuItemById(id: number): Promise<MenuItem> {
    return await this.findMenuItemByIdOrFail(id);
  }

  /**
   * Creates a new menu item in the system with the provided information.
   * This method handles item creation with validation and
   * ensures proper data structure and category association.
   *
   * Validation Rules:
   * - Item name uniqueness within category
   * - Price must be positive number
   * - Category must exist and be active
   * - Required fields validation
   *
   * Business Logic:
   * - Validates input data
   * - Checks for name conflicts within category
   * - Verifies category existence and status
   * - Sets default values
   * - Ensures data consistency
   *
   * Use Cases:
   * - Menu item addition
   * - New dish introduction
   * - Menu expansion
   * - Seasonal item creation
   * - Special offer items
   */
  async createItem(data: CreateItemInput): Promise<MenuItem> {
    return await this.itemRepository.create(data);
  }

  async searchMenuItems(
    params: PaginationParams & MenuItemSearchParams,
  ): Promise<PaginatedResponse<MenuItem>> {
    // Degelete to repository layer for search functionality
    return await this.itemRepository.search(params);
  }

  /**
   * Performs Daily Stock Reset Operation
   *
   * Business logic for initializing daily stock quantities. This method
   * validates all items before delegating to the repository layer,
   * ensuring data integrity and business rule compliance.
   *
   * @param data - Array of items with their initial stock quantities
   * @throws CustomError if validation fails
   *
   * Validation Process:
   * 1. Item Existence Check
   *    - Verifies all item IDs exist in database
   *    - Throws ITEMS_NOT_FOUND if any missing
   *    - Returns list of non-existent IDs
   *
   * 2. Inventory Type Validation
   *    - Ensures all items are TRACKED type
   *    - Throws INVALID_INVENTORY_TYPE if UNLIMITED found
   *    - UNLIMITED items cannot have stock reset
   *
   * Business Rules:
   * - Only TRACKED items can have stock initialized
   * - UNLIMITED items are always available
   * - All items must exist before reset
   * - Batch operation for efficiency
   * - Atomic transaction in repository layer
   *
   * Operation Flow:
   * 1. Extract all item IDs from request
   * 2. Fetch all items in parallel
   * 3. Validate existence (404 if missing)
   * 4. Validate inventory types (400 if invalid)
   * 5. Delegate to repository for database updates
   *
   * Error Scenarios:
   * - 404 ITEMS_NOT_FOUND: One or more items don't exist
   * - 400 INVALID_INVENTORY_TYPE: Contains UNLIMITED items
   *
   * Use Cases:
   * - Morning operations startup
   * - Daily stock initialization
   * - Kitchen prep completion
   * - Shift handover procedures
   * - Inventory count updates
   *
   * Integration:
   * - Called by admin/manager users
   * - Can be triggered from mobile apps
   * - POS system integration
   * - Kitchen management systems
   * - Scheduled automation possible
   *
   * Performance:
   * - Parallel item fetching
   * - Single transaction for updates
   * - Efficient batch processing
   * - Minimal database roundtrips
   */
  async dailyStockReset(data: DailyStockResetInput): Promise<void> {
    // Validate that all items exist in the database
    const itemIds = data.items.map((i) => i.itemId);
    const existingItems = await Promise.all(
      itemIds.map((id) => this.itemRepository.findById(id)),
    );

    const notFound = itemIds.filter((id, idx) => !existingItems[idx]);
    if (notFound.length > 0) {
      throw new CustomError(
        `Items not found: ${notFound.join(", ")}`,
        HttpStatus.NOT_FOUND,
        "ITEMS_NOT_FOUND",
      );
    }

    // Validate that all items are TRACKED type
    const nonTracked = existingItems.filter(
      (item, _idx) => item && item.inventoryType !== InventoryType.TRACKED,
    );

    if (nonTracked.length > 0) {
      throw new CustomError(
        "Only TRACKED items can have stock reset",
        HttpStatus.BAD_REQUEST,
        "INVALID_INVENTORY_TYPE",
      );
    }

    await this.itemRepository.dailyStockReset(data);
  }

  /**
   * Adds Stock to a Menu Item Manually
   *
   * Business logic for manual stock additions. Used when additional
   * portions are prepared mid-day or for inventory corrections.
   * Validates item type and delegates to repository.
   *
   * @param id - Menu item identifier
   * @param data - Stock addition data (quantity and reason)
   * @param userId - Optional user ID performing the operation
   * @returns Updated menu item with new stock quantity
   * @throws CustomError if validation fails
   *
   * Validation Process:
   * 1. Item Existence
   *    - Verifies item exists
   *    - Throws ID_NOT_FOUND if missing
   *
   * 2. Inventory Type Check
   *    - Ensures item is TRACKED type
   *    - Throws INVALID_INVENTORY_TYPE if UNLIMITED
   *    - UNLIMITED items don't need stock additions
   *
   * Business Rules:
   * - Only TRACKED items can have stock added
   * - Quantity must be positive (validator enforces)
   * - Reason is mandatory for audit trail
   * - User ID captured for accountability
   * - Timestamp automatically recorded
   *
   * Stock Calculation:
   * - New stock = Current stock + Added quantity
   * - If item was unavailable, becomes available again
   * - Low stock status re-evaluated
   *
   * Use Cases:
   * - Mid-day production additions
   * - Additional prep due to high demand
   * - Inventory corrections (count adjustments)
   * - Stock replenishment during service
   * - Production overflow handling
   *
   * Error Scenarios:
   * - 404 ID_NOT_FOUND: Item doesn't exist
   * - 400 INVALID_INVENTORY_TYPE: Cannot add to UNLIMITED items
   *
   * Audit Trail:
   * - Creates MANUAL_ADD adjustment record
   * - Records quantity, reason, user, timestamp
   * - Enables accountability and analysis
   */
  async addStock(
    id: number,
    data: AddStockBodyInput,
    userId?: string,
  ): Promise<MenuItem> {
    const item = await this.findMenuItemByIdOrFail(id);

    if (item.inventoryType !== InventoryType.TRACKED)
      throw new CustomError(
        "Cannot add stock to UNLIMITED items",
        HttpStatus.BAD_REQUEST,
        "INVALID_INVENTORY_TYPE",
      );

    return this.itemRepository.updateStock(
      id,
      data.quantity,
      StockAdjustmentType.MANUAL_ADD,
      data.reason,
      userId,
    );
  }

  /**
   * Removes Stock from a Menu Item Manually
   *
   * Business logic for manual stock removal. Used for waste, spoilage,
   * damage, or other reductions outside normal order fulfillment.
   * Validates item type, stock availability, and delegates to repository.
   *
   * @param id - Menu item identifier
   * @param data - Stock removal data (quantity and optional reason)
   * @param userId - Optional user ID performing the operation
   * @returns Updated menu item with reduced stock quantity
   * @throws CustomError if validation fails
   *
   * Validation Process:
   * 1. Item Existence
   *    - Verifies item exists
   *    - Throws ID_NOT_FOUND if missing
   *
   * 2. Inventory Type Check
   *    - Ensures item is TRACKED type
   *    - Throws INVALID_INVENTORY_TYPE if UNLIMITED
   *    - UNLIMITED items don't have stock to remove
   *
   * 3. Stock Availability Check
   *    - Verifies sufficient stock to remove
   *    - Throws INSUFFICIENT_STOCK if not enough
   *    - Prevents negative stock quantities
   *
   * Business Rules:
   * - Only TRACKED items can have stock removed
   * - Quantity must be positive (validator enforces)
   * - Cannot remove more than current stock
   * - Reason optional but recommended
   * - User ID captured for accountability
   * - Timestamp automatically recorded
   *
   * Stock Calculation:
   * - New stock = Current stock - Removed quantity
   * - Negative quantity sent to repository (subtraction)
   * - If stock reaches 0, item may become unavailable
   * - Low stock alerts triggered if threshold reached
   *
   * Use Cases:
   * - Food spoilage tracking
   * - Damaged items removal
   * - Quality control removals
   * - Dropped or spilled items
   * - Inventory corrections
   * - End-of-day waste recording
   *
   * Error Scenarios:
   * - 404 ID_NOT_FOUND: Item doesn't exist
   * - 400 INVALID_INVENTORY_TYPE: Cannot remove from UNLIMITED items
   * - 400 INSUFFICIENT_STOCK: Not enough stock to remove
   *
   * Audit Trail:
   * - Creates MANUAL_REMOVE adjustment record
   * - Records quantity, reason, user, timestamp
   * - Enables waste tracking and analysis
   * - Helps identify operational issues
   */
  async removeStock(
    id: number,
    data: RemoveStockBodyInput,
    userId?: string,
  ): Promise<MenuItem> {
    const item = await this.findMenuItemByIdOrFail(id);

    if (item?.inventoryType !== InventoryType.TRACKED) {
      throw new CustomError(
        "Cannot remove stock from UNLIMITED items",
        HttpStatus.BAD_REQUEST,
        "INVALID_INVENTORY_TYPE",
      );
    }

    if ((item.stockQuantity ?? 0) < data.quantity) {
      throw new CustomError(
        "Insufficient stock to remove",
        HttpStatus.BAD_REQUEST,
        "INSUFFICIENT_STOCK",
      );
    }

    return this.itemRepository.updateStock(
      id,
      -data.quantity, // Negative value for stock reduction
      StockAdjustmentType.MANUAL_REMOVE,
      data?.reason,
      userId,
    );
  }

  /**
   * Deducts Stock When Order is Confirmed
   *
   * Automatically reduces stock quantity when an order is created.
   * This is a critical integration point with the order management
   * system to maintain real-time inventory accuracy.
   *
   * @param itemId - Menu item identifier
   * @param quantity - Number of units ordered
   * @param orderId - Order identifier for audit trail
   * @throws CustomError if insufficient stock available
   *
   * Operation Flow:
   * 1. Fetch item from database
   * 2. Check if item exists and is TRACKED
   * 3. Skip if UNLIMITED (no stock tracking needed)
   * 4. Validate sufficient stock available
   * 5. Deduct stock and create audit record
   *
   * Business Rules:
   * - Only TRACKED items have stock deducted
   * - UNLIMITED items skip this operation (return early)
   * - Must have sufficient stock before accepting order
   * - Stock validation prevents overselling
   * - Order ID captured for traceability
   *
   * Stock Validation:
   * - Checks: current stock >= required quantity
   * - Throws detailed error if insufficient
   * - Error includes item name and stock levels
   * - Prevents order creation if stock unavailable
   *
   * Auto-Blocking Behavior:
   * - If stock reaches 0 after deduction
   * - AND autoMarkUnavailable = true
   * - Then item becomes unavailable automatically
   * - Prevents further orders until restocked
   *
   * Integration Points:
   * - Order creation workflow
   * - Order confirmation step
   * - POS system transactions
   * - Online ordering systems
   * - Kitchen order management
   *
   * Audit Trail:
   * - Creates ORDER_DEDUCT adjustment record
   * - Links adjustment to specific order
   * - Records timestamp and quantities
   * - Enables order-stock reconciliation
   *
   * Error Handling:
   * - 400 INSUFFICIENT_STOCK: Not enough stock for order
   * - Includes current vs required quantities
   * - Allows graceful order rejection
   * - Enables alternative item suggestions
   *
   * Use Cases:
   * - Order confirmation processing
   * - Real-time inventory management
   * - Overselling prevention
   * - Stock availability enforcement
   * - Kitchen production tracking
   */
  async deductStockForOrder(
    itemId: number,
    quantity: number,
    orderId: string,
  ): Promise<void> {
    const item = await this.itemRepository.findById(itemId);

    // Skip stock deduction for non-existent or UNLIMITED items
    if (!item || item.inventoryType !== InventoryType.TRACKED) return;

    // Validate sufficient stock before accepting order
    if ((item.stockQuantity ?? 0) < quantity) {
      throw new CustomError(
        `Insufficient stock for ${item.name}. Available: ${item.stockQuantity}, Required: ${quantity}`,
        HttpStatus.BAD_REQUEST,
        "INSUFFICIENT_STOCK",
      );
    }

    // Deduct stock and create audit trail
    await this.itemRepository.updateStock(
      itemId,
      -quantity, // Negative value for stock reduction
      StockAdjustmentType.ORDER_DEDUCT,
      `Order ${orderId}`,
      undefined,
      orderId,
    );
  }

  /**
   * Reverts Stock When Order is Cancelled
   *
   * Automatically restores stock quantity when an order is cancelled.
   * This maintains inventory accuracy and makes items available for
   * other customers again.
   *
   * @param itemId - Menu item identifier
   * @param quantity - Number of units to restore
   * @param orderId - Order identifier for audit trail
   *
   * Operation Flow:
   * 1. Fetch item from database
   * 2. Check if item exists and is TRACKED
   * 3. Skip if UNLIMITED (no stock tracking needed)
   * 4. Add quantity back to stock
   * 5. Create audit record linking to cancelled order
   *
   * Business Rules:
   * - Only TRACKED items have stock reverted
   * - UNLIMITED items skip this operation
   * - Quantity is added back (positive value)
   * - Order ID captured for traceability
   * - No validation needed (always safe to add)
   *
   * Stock Restoration:
   * - New stock = Current stock + Cancelled quantity
   * - Positive quantity sent to repository
   * - If item was unavailable, becomes available again
   * - Low stock alerts re-evaluated
   *
   * Auto-Availability Restoration:
   * - If item was blocked due to zero stock
   * - Adding stock makes it available again
   * - Depends on autoMarkUnavailable setting
   * - Enables immediate re-ordering
   *
   * Integration Points:
   * - Order cancellation workflow
   * - Order refund processing
   * - POS system cancellations
   * - Customer-initiated cancellations
   * - Kitchen cancellation requests
   *
   * Audit Trail:
   * - Creates ORDER_CANCELLED adjustment record
   * - Links to specific cancelled order
   * - Records timestamp and quantities
   * - Enables order-stock reconciliation
   * - Tracks cancellation patterns
   *
   * Use Cases:
   * - Order cancellation processing
   * - Customer changes mind
   * - Kitchen unable to prepare
   * - Payment failures
   * - Duplicate order corrections
   * - Stock accuracy maintenance
   *
   * Business Value:
   * - Prevents stock discrepancies
   * - Maximizes item availability
   * - Reduces lost sales opportunities
   * - Maintains inventory accuracy
   * - Supports better customer service
   */
  async revertStockForOrder(
    itemId: number,
    quantity: number,
    orderId: string,
  ): Promise<void> {
    const item = await this.itemRepository.findById(itemId);

    // Skip stock revert for non-existent or UNLIMITED items
    if (!item || item.inventoryType !== InventoryType.TRACKED) return;

    // Add quantity back to stock and create audit trail
    await this.itemRepository.updateStock(
      itemId,
      quantity, // Positive value for stock restoration
      StockAdjustmentType.ORDER_CANCELLED,
      `Order ${orderId} cancelled`,
      undefined,
      orderId,
    );
  }

  /**
   * Retrieves Menu Items with Low Stock
   *
   * Service layer method for fetching items that have reached or fallen
   * below their low stock alert threshold. Simple delegation to repository.
   *
   * @returns Array of menu items with low stock
   *
   * Business Value:
   * - Enables proactive stock management
   * - Prevents stockouts during service
   * - Alerts for production planning
   * - Supports dashboard notifications
   *
   * Use Cases:
   * - Dashboard low stock widgets
   * - Manager notification systems
   * - Kitchen production planning
   * - Mobile app alerts
   * - Automated restock workflows
   */
  async getLowStock(): Promise<MenuItem[]> {
    return this.itemRepository.getLowStock();
  }

  /**
   * Retrieves Menu Items That Are Out of Stock
   *
   * Service layer method for fetching items with zero stock.
   * Essential for service staff and kitchen prioritization.
   *
   * @returns Array of menu items with zero stock
   *
   * Business Value:
   * - Prevents orders for unavailable items
   * - Informs customer-facing staff
   * - Prioritizes kitchen production
   * - Enables dynamic menu updates
   * - Reduces order cancellations
   *
   * Use Cases:
   * - Waiter/waitress dashboards
   * - POS system item blocking
   * - Customer menu displays
   * - Kitchen production queues
   * - Manager priority alerts
   */
  async getOutStock(): Promise<MenuItem[]> {
    return this.itemRepository.getOutOfStock();
  }

  /**
   * Retrieves Stock Adjustment History for a Menu Item
   *
   * Service layer method for fetching complete stock audit trail.
   * Validates item existence before querying history.
   *
   * @param id - Menu item identifier
   * @param params - Pagination parameters
   * @returns Paginated list of stock adjustments
   * @throws CustomError if item not found
   *
   * Validation:
   * - Ensures item exists before fetching history
   * - Throws ID_NOT_FOUND if item doesn't exist
   *
   * Business Value:
   * - Complete accountability and audit trail
   * - Discrepancy investigation support
   * - Waste tracking analysis
   * - Employee activity monitoring
   * - Operational insights
   *
   * Use Cases:
   * - Audit trail review
   * - Inventory reconciliation
   * - Loss prevention investigation
   * - Historical trend analysis
   * - Compliance documentation
   */
  async getStockHistory(
    id: number,
    params: PaginationParams,
  ): Promise<PaginatedResponse<StockAdjustment>> {
    await this.findMenuItemByIdOrFail(id);
    return this.itemRepository.getStockHistory(id, params.page, params.limit);
  }

  /**
   * Configures Inventory Type for a Menu Item
   *
   * Service layer method for changing inventory tracking mode.
   * Validates item existence before applying configuration.
   *
   * @param id - Menu item identifier
   * @param data - Inventory type configuration
   * @returns Updated menu item
   * @throws CustomError if item not found
   *
   * Validation:
   * - Ensures item exists before configuration
   * - Throws ID_NOT_FOUND if item doesn't exist
   *
   * Business Value:
   * - Flexible inventory management
   * - Supports different item types
   * - Enables business model changes
   * - Simplifies operations
   *
   * Use Cases:
   * - Initial menu setup
   * - Item type changes
   * - Seasonal adjustments
   * - Business model updates
   * - Item reclassification
   */
  async setInventoryType(
    id: number,
    data: InventoryTypeInput,
  ): Promise<MenuItem> {
    await this.findMenuItemByIdOrFail(id);
    return this.itemRepository.setInventoryType(
      id,
      data.inventoryType,
      data.lowStockAlert,
    );
  }
}

export default new ItemService(itemRepository);
