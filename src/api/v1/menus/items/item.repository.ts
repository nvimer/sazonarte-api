import { MenuItem, StockAdjustment } from "@prisma/client";
import { ItemRepositoryInterface } from "./interfaces/item.repository.interface";
import {
  CreateItemInput,
  DailyStockResetInput,
  MenuItemSearchParams,
} from "./item.validator";
import prisma from "../../../../database/prisma";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../../utils/pagination.helper";
import {
  InventoryType,
  StockAdjustmentType,
} from "../../../../types/prisma.types";

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

  async search(
    params: PaginationParams & MenuItemSearchParams,
  ): Promise<PaginatedResponse<MenuItem>> {
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
        mode: "insensitive", // Case-insensitive searc
      };
    }

    // add actice filter if provided
    if (active === undefined) {
      whereConditions.active = active;
    }

    // Execute search and count in parallel
    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: whereConditions,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.menuItem.count({
        where: whereConditions,
      }),
    ]);

    return createPaginatedResponse(menuItems, total, { page, limit });
  }

  /**
   * Updates Stock Quantity for a Menu Item
   *
   * Core method for all stock adjustment operations. This method handles
   * stock modifications while maintaining data integrity and audit trail.
   *
   * @param id - Menu item identifier
   * @param quantity - Amount to adjust (+/- value)
   * @param adjustmentType - Type of adjustment (DAILY_RESET, MANUAL_ADD, ORDER_DEDUCT, etc.)
   * @param reason - Optional explanation for the adjustment
   * @param userId - Optional user who performed the adjustment
   * @param orderId - Optional order associated with adjustment
   * @returns Updated menu item with new stock quantity
   * @throws Error if menu item not found
   *
   * Stock Calculation:
   * - newStock = previousStock + quantity
   * - Positive quantity = stock increase
   * - Negative quantity = stock decrease
   *
   * Auto-Blocking Behavior:
   * - If autoMarkUnavailable = true AND newStock <= 0
   * - Then isAvailable is set to false
   * - Item becomes unavailable for ordering
   * - Prevents orders for out-of-stock items
   *
   * Audit Trail:
   * - Every stock change creates a StockAdjustment record
   * - Captures: previous value, new value, change amount
   * - Records: reason, user, order, timestamp
   * - Enables complete history reconstruction
   *
   * Use Cases:
   * - Daily stock initialization
   * - Manual stock additions (production)
   * - Manual stock removals (waste, spoilage)
   * - Order fulfillment (auto-deduct)
   * - Order cancellation (revert stock)
   *
   * Business Rules:
   * - Item must exist before updating
   * - Previous stock defaults to 0 if null
   * - Negative stock is prevented by service layer
   * - Auto-blocking protects inventory integrity
   */
  async updateStock(
    id: number,
    quantity: number,
    adjustmentType: string,
    reason?: string,
    userId?: string,
    orderId?: string,
  ): Promise<MenuItem> {
    const item = await prisma.menuItem.findUnique({ where: { id } });

    if (!item) {
      throw new Error(`MenuItem with id ${id} not found`);
    }
    const previousStock = item.stockQuantity ?? 0;
    const newStock = previousStock + quantity;

    // Update item and create adjustment record in atomic transaction
    const [updatedItem] = await prisma.$transaction([
      prisma.menuItem.update({
        where: { id },
        data: {
          stockQuantity: newStock,
          // Auto-block item if stock depleted and auto-blocking enabled
          isAvailable:
            item.autoMarkUnavailable && newStock <= 0
              ? false
              : item.isAvailable,
        },
      }),
      prisma.stockAdjustment.create({
        data: {
          menuItemId: id,
          adjustmentType,
          previousStock,
          newStock,
          quantity,
          reason,
          userId,
          orderId,
        },
      }),
    ]);
    return updatedItem;
  }

  /**
   * Performs Daily Stock Reset for Multiple Menu Items
   *
   * Batch operation to initialize stock quantities at the beginning
   * of each business day. This method handles multiple items efficiently
   * in a single transaction for optimal performance.
   *
   * @param menuItems - Array of items with their initial stock quantities
   * @returns Promise<void> - Operation doesn't return data
   *
   * Operation Flow:
   * 1. Updates stock quantities for all items in batch
   * 2. Sets initialStock to track daily starting point
   * 3. Updates low stock alert thresholds
   * 4. Marks all items as available
   * 5. Creates audit records for each adjustment
   *
   * Item Updates:
   * - stockQuantity: Set to provided quantity
   * - initialStock: Same as stockQuantity (daily baseline)
   * - lowStockAlert: Updated if provided, maintains existing if not
   * - isAvailable: Set to true (assumes items ready for sale)
   *
   * Audit Trail:
   * - Creates StockAdjustment record for each item
   * - Adjustment type: DAILY_RESET
   * - Previous stock: 0 (assumes reset from previous day)
   * - Reason: "Begin of the day"
   * - Timestamp: Automatically captured
   *
   * Performance Optimization:
   * - Batch updates minimize database roundtrips
   * - Single transaction reduces overhead
   * - createMany for efficient audit record insertion
   *
   * Business Rules:
   * - All items must exist (validated by service layer)
   * - All items must be TRACKED type (validated by service layer)
   * - Operation is idempotent (can be re-run safely)
   * - Previous day's stock is not preserved
   *
   * Use Cases:
   * - Morning operations startup
   * - Daily stock initialization
   * - Kitchen prep completion
   * - Shift handover procedures
   * - Inventory count updates
   * - Kitchen management systems
   */
  async dailyStockReset(menuItems: DailyStockResetInput): Promise<void> {
    await prisma.$transaction(
      menuItems.items.map((item) =>
        prisma.menuItem.update({
          where: { id: item.itemId },
          data: {
            stockQuantity: item.quantity,
            initialStock: item.quantity,
            lowStockAlert: item.lowStockAlert,
            isAvailable: true,
          },
        }),
      ),
    );

    // Create adjustment records for audit trail
    await prisma.stockAdjustment.createMany({
      data: menuItems.items.map((item) => ({
        menuItemId: item.itemId,
        adjustmentType: StockAdjustmentType.DAILY_RESET,
        previousStock: 0,
        newStock: item.quantity,
        quantity: item.quantity,
        reason: "Begin of the day",
      })),
    });
  }

  /**
   * Retrieves Menu Items with Low Stock
   *
   * Queries the database for items that have reached or fallen below
   * their low stock alert threshold. This enables proactive inventory
   * management and prevents stockouts during service.
   *
   * @returns Array of menu items with low stock
   *
   * Query Criteria:
   * - inventoryType = TRACKED (only tracked items have stock limits)
   * - deleted = false (excludes soft-deleted items)
   * - stockQuantity <= lowStockAlert (comparison with item's threshold)
   *
   * Low Stock Logic:
   * - Each item has its own lowStockAlert threshold
   * - Default threshold is 5 units
   * - Can be customized per item
   * - Comparison: current stock <= alert threshold
   *
   * Use Cases:
   * - Dashboard low stock alerts
   * - Kitchen production planning
   * - Manager notification system
   * - Mobile app alerts
   * - Automated restock workflows
   * - End-of-service reports
   */
  async getLowStock(): Promise<MenuItem[]> {
    return prisma.menuItem.findMany({
      where: {
        inventoryType: InventoryType.TRACKED,
        deleted: false,
        stockQuantity: {
          lte: prisma.menuItem.fields.lowStockAlert,
        },
      },
    });
  }

  /**
   * Retrieves Menu Items That Are Out of Stock
   *
   * Queries for items that have completely depleted their stock.
   * Essential for service staff to know what cannot be ordered and
   * for managers to prioritize production needs.
   *
   * @returns Array of menu items with zero stock
   *
   * Query Criteria:
   * - inventoryType = TRACKED (only tracked items can be out of stock)
   * - deleted = false (excludes soft-deleted items)
   * - stockQuantity = 0 (exactly zero, fully depleted)
   *
   * Out of Stock Behavior:
   * - Items with autoMarkUnavailable=true are automatically unavailable
   * - Items still appear in this list even if unavailable
   * - Useful for production priority planning
   * - Helps prevent order fulfillment errors
   *
   * Use Cases:
   * - Waiter/waitress dashboard display
   * - POS system item blocking
   * - Customer ordering interface (hide items)
   * - Kitchen production queue
   * - Manager priority alerts
   * - End-of-shift reports
   *
   *
   * Integration Points:
   * - Waiter mobile apps
   * - Customer-facing digital menus
   * - POS systems
   * - Kitchen display systems
   * - Manager dashboards
   * - Real-time menu availability updates
   */
  async getOutOfStock(): Promise<MenuItem[]> {
    return prisma.menuItem.findMany({
      where: {
        inventoryType: InventoryType.TRACKED,
        deleted: false,
        stockQuantity: 0,
      },
    });
  }

  /**
   * Retrieves Stock Adjustment History for a Menu Item
   *
   * Provides a complete audit trail of all stock changes for a specific
   * menu item with pagination support. Essential for accountability,
   * troubleshooting, and inventory analysis.
   *
   * @param itemId - Menu item identifier
   * @param page - Current page number (1-indexed)
   * @param limit - Number of records per page
   * @returns Paginated list of stock adjustments
   *
   * Query Features:
   * - Filters by specific menu item
   * - Sorted by createdAt DESC (newest first)
   * - Implements pagination (skip/take)
   * - Calculates total record count
   * - Parallel execution for performance
   *
   * Adjustment Record Contents:
   * - adjustmentType: DAILY_RESET, MANUAL_ADD, MANUAL_REMOVE, ORDER_DEDUCT, ORDER_CANCELLED
   * - previousStock: Stock quantity before change
   * - newStock: Stock quantity after change
   * - quantity: Amount changed (+/-)
   * - reason: Explanation for the change
   * - userId: Who made the change (if applicable)
   * - orderId: Related order (if applicable)
   * - createdAt: Timestamp of the change
   *
   * Use Cases:
   * - Audit trail investigation
   * - Discrepancy resolution
   * - Waste tracking analysis
   * - Employee activity review
   * - Order fulfillment verification
   * - Historical trend analysis
   * - Inventory reconciliation
   * - Loss prevention investigation
   *
   * Business Value:
   * - Complete accountability
   * - Fraud detection capability
   * - Operational insights
   * - Training opportunities
   * - Process improvement data
   * - Compliance documentation
   */
  async getStockHistory(
    itemId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<StockAdjustment>> {
    const skip = (page - 1) * limit;

    const [adjustments, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where: { menuItemId: itemId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.stockAdjustment.count({
        where: { menuItemId: itemId },
      }),
    ]);

    return createPaginatedResponse(adjustments, total, { page, limit });
  }

  /**
   * Configures Inventory Type for a Menu Item
   *
   * Changes how stock is managed for a menu item. Switches between
   * tracked (limited stock) and unlimited (always available) modes.
   * Includes automatic cleanup of stock data when appropriate.
   *
   * @param id - Menu item identifier
   * @param inventoryType - New inventory type ("TRACKED" or "UNLIMITED")
   * @param lowStockAlert - Optional low stock threshold (for TRACKED items)
   * @returns Updated menu item
   *
   * Inventory Types:
   *
   * TRACKED:
   * - Stock quantity is monitored
   * - Requires daily stock reset
   * - Auto-deducts on orders
   * - Can become unavailable
   * - Low stock alerts active
   * - Suitable for: Pre-prepared dishes, limited items
   *
   * UNLIMITED:
   * - No stock tracking
   * - Always available
   * - No stock deduction
   * - No alerts
   * - Stock fields cleared
   * - Suitable for: Bottled drinks, unlimited items
   *
   * Data Updates:
   * - inventoryType: Set to new value
   * - lowStockAlert: Updated if provided
   *
   * When changing to UNLIMITED:
   * - stockQuantity: Set to null
   * - initialStock: Set to null
   * - Clears stock tracking data
   * - Prevents confusion with old values
   *
   * When changing to TRACKED:
   * - lowStockAlert: Updated if provided
   * - Stock values remain null
   * - Requires subsequent daily-reset call
   * - Stock must be initialized before use
   *
   * Business Rules:
   * - Item must exist before configuring
   * - Configuration change is immediate
   * - Doesn't affect historical adjustments
   * - isAvailable status preserved
   * - No audit trail created (configuration change)
   *
   * Side Effects:
   * - TRACKED → UNLIMITED: Clears stock data
   * - UNLIMITED → TRACKED: Requires stock initialization
   * - May affect ordering behavior immediately
   * - Dashboard displays update
   *
   * Use Cases:
   * - Initial menu setup
   * - Menu item type changes
   * - Seasonal inventory adjustments
   * - Business model changes
   * - Item reclassification
   * - Inventory system migration
   */
  async setInventoryType(
    id: number,
    inventoryType: string,
    lowStockAlert?: number,
  ): Promise<MenuItem> {
    return prisma.menuItem.update({
      where: {
        id,
      },
      data: {
        inventoryType,
        lowStockAlert,
        // Clear stock data when switching to UNLIMITED type
        ...(inventoryType === "UNLIMITED" && {
          stockQuantity: null,
          initialStock: null,
        }),
      },
    });
  }
}

export default new ItemRepository();
