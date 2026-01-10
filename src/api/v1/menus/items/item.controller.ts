import { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { ItemServiceInterface } from "./interfaces/item.service.interface";
import {
  AddStockBodyInput,
  CreateItemInput,
  DailyStockResetInput,
  InventoryTypeInput,
  MenuItemSearchParams,
} from "./item.validator";
import { HttpStatus } from "../../../../utils/httpStatus.enum";
import itemService from "./item.service";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";

/**
 * Menu Item Controller
 *
 * This controller is responsible for:
 * - Processing incoming HTTP requests for menu item operations
 * - Menu item CRUD operations (Create, Read, Update, Delete)
 * - Menu item creation and management
 * - Delegating business logic to item service layer
 *
 * Menu item operations include:
 * - Creating new menu items
 * - Associating items with categories
 * - Item pricing and availability management
 * - Item description and details
 *
 * Business Features:
 * - Menu item creation and management
 * - Category association
 * - Pricing and availability control
 * - Item description and details
 * - Menu organization
 */
class ItemController {
  constructor(private itemService: ItemServiceInterface) { }

  /**
   * GET /menu-items
   *
   * Retrieves a paginated list of all menu-items in the system.
   * This endpoint supports pagination parameters for efficient
   * data retrieval and display.
   *
   * Response:
   * - 200: Menu Items retrieved successfully with pagination metadata
   * - 400: Invalid pagination parameters
   * - 500: Server error during retrieval
   *
   * Pagination Features:
   * - Configurable page size
   * - Page number tracking
   * - Metadata for client-side pagination
   * - Default values for missing parameters
   *
   *  Use Cases:
   * - Restaurant Menu Items management dashboard
   * - Menu Item availability overview
   * - Administrative menu-item listing
   */
  getMenuItems = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    const params: PaginationParams = { page, limit };
    const menuItems = await this.itemService.findAllMenuItems(params);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Menu Items fetched successfully",
      data: menuItems.data,
      meta: menuItems.meta,
    });
  });

  /*
   * GET /menus/search
   *
   * Searches menu items with filtering and pagination capabilities.
   * This endpoint allows searching by name/description and filtering
   * by active status for efficient menu item management.
   *
   * @param req - Express request object with search and filter Parameters
   * @param res - Express response object
   *
   * Query Paramenters:
   * - page: Page number (optional, defailts to 1)
   * - limit: Number of items per page (optional, defaults to 10)
   * - search: Search term for name/description (optional)
   * - active: Filter by active status (true/false, optional)
   *
   * Response:
   * - 200: Filtered menu items retrieved successfully
   * - 400: Invalid search parameters
   * - 500: Server error during search
   *
   * Search Features:
   * - Text-based search in name and description
   * - Boolean filtering by active status
   * - Pagination support for large result sets
   * - Case-insensitive search
   *
   * Use Cases:
   * - Menu Item s search interface
   * - Menu organization workflows
   * - Administrative filtering
   * - Menu Items discovery and management
   */
  searchMenuItems = asyncHandler(async (req: Request, res: Response) => {
    // Extract pagination and search Parameters
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const limit = Number(req.query.limit) || DEFAULT_LIMIT;
    const search = req.query.search as string;
    const active =
      req.query.active === "true"
        ? true
        : req.query.active === "false"
          ? false
          : undefined;

    // Create combined parameters object
    const params: PaginationParams & MenuItemSearchParams = {
      page,
      limit,
      search,
      active,
    };

    // Search menu items from service layer
    const menuItems = await this.itemService.searchMenuItems(params);

    // Return successful response with search results
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Menu Items search completed successfully",
      data: menuItems,
    });
  });

  /**
   * GET /items/:id
   *
   * Retrieves detailed information about a specific menu item by its ID.
   * This endpoint provides complete menu-item information including
   * name, description, price, imageUrl, isExtra and isAvailable booleans.
   *
   * URL Parameters:
   * - id: Category ID (integer, required)
   *
   * Response:
   * - 200: Menu item details retrieved successfully
   * - 400: Invalid menu item  ID format
   * - 404: Menu item not found
   * - 500: Server error during retrieval
   *
   * Menu item  Information:
   * - Menu item ID and name
   * - Description and purpose
   * - Price
   * - ImageUrl for save image of product
   * - isExtra and isAvailable for manage dish
   * - Associated menu items count
   *
   * Uses Cases:
   * - Individual menu item details view
   * - Menu item editing interface
   * - Category assignament verification
   * - Menu item audit and review
   */
  getMenuItem = asyncHandler(async (req: Request, res: Response) => {
    // Extract and convert menu item ID from URL parameters
    const id = Number(req.params.id);

    // Fetch specific menu item from service layer
    const menuItem = await this.itemService.findMenuItemById(id);

    // Return successful response with item data
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Menu Item fetched successfully",
      data: menuItem,
    });
  });

  /**
   * POST /items
   *
   * Creates a new menu item in the system with the provided information.
   * This endpoint handles item creation with validation and
   * ensures proper data structure and category association.
   *
   * Request Body:
   * - name: Item name/identifier (string, required)
   * - description: Item description (string, optional)
   * - price: Item price (number, required)
   * - categoryId: Associated category ID (number, required)
   * - active: Active status (boolean, optional, defaults to true)
   * - imageUrl: Item image URL (string, optional)
   * - allergens: Array of allergens (string[], optional)
   * - preparationTime: Preparation time in minutes (number, optional)
   *
   * Response:
   * - 201: Item created successfully
   * - 400: Invalid request data or validation errors
   * - 404: Category not found
   * - 409: Item with same name already exists in category
   * - 500: Server error during creation
   *
   * Validation:
   * - Item name uniqueness within category
   * - Required fields validation
   * - Price validation (positive number)
   * - Category existence validation
   * - Name format and length validation
   *
   * Use Cases:
   * - Menu item addition
   * - New dish introduction
   * - Menu expansion
   * - Seasonal item creation
   * - Special offer items
   *
   * Business Rules:
   * - Item must be associated with a valid category
   * - Item name must be unique within its category
   * - Price must be a positive number
   * - Item is active by default
   * - Preparation time is optional but useful for kitchen planning
   */
  postItem = asyncHandler(async (req: Request, res: Response) => {
    // Extract validated item data from request body
    const data: CreateItemInput = req.body;

    // Create new item through service layer
    const item = await this.itemService.createItem(data);

    // Return successful response with created item
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Item created successfully",
      data: item,
    });
  });

  /**
   * POST /items/stock/daily-reset
   *
   * Registers the initial stock quantities for menu items at the start of the day.
   * This endpoint allows administrators to set stock levels for all pre-prepared
   * dishes in a single batch operation.
   *
   * @param req - Express request object with stock data in body
   * @param res - Express response object
   *
   * Request Body:
   * - items: Array of stock initialization objects
   *   - itemId: Menu item identifier (positive integer, required)
   *   - quantity: Initial stock quantity for the day (non-negative integer, required)
   *   - lowStockAlert: Alert threshold (non-negative integer, optional)
   *
   * Response:
   * - 200: Stock reset completed successfully
   * - 400: Invalid request data (validation errors, UNLIMITED items, etc.)
   * - 401: User not authenticated
   * - 403: User lacks required permissions
   * - 404: One or more items not found
   * - 500: Server error during operation
   *
   * Validation:
   * - All item IDs must exist in database
   * - All items must have TRACKED inventory type
   * - Quantities must be non-negative integers
   * - At least one item required in array
   * - Low stock alert must be non-negative if provided
   *
   * Business Logic:
   * - Sets stockQuantity and initialStock to provided values
   * - Updates lowStockAlert if provided
   * - Marks all items as available
   * - Creates audit trail entries
   * - Operations performed in atomic transaction
   *
   * Use Cases:
   * - Morning operations startup
   * - Daily stock initialization
   * - Kitchen prep completion check-in
   * - Shift handover procedures
   * - Inventory count updates
   *
   * Security:
   * - Requires authentication (JWT token)
   * - Requires ADMIN or MANAGER role
   * - Operation is logged for audit
   *
   * Example Request:
   * ```json
   * {
   *   "items": [
   *     { "itemId": 1, "quantity": 30, "lowStockAlert": 5 },
   *     { "itemId": 2, "quantity": 25, "lowStockAlert": 3 }
   *   ]
   * }
   * ```
   */
  dailyStockReset = asyncHandler(async (req: Request, res: Response) => {
    const data: DailyStockResetInput = req.body;

    await this.itemService.dailyStockReset(data);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Daily stock reset successfully",
    });
  });

  /**
   * POST /items/:id/stock/add
   *
   * Manually adds stock to a specific menu item. This endpoint is used
   * for mid-day stock additions, such as additional production runs or
   * inventory corrections.
   *
   * @param req - Express request object with item ID in params and stock data in body
   * @param res - Express response object
   *
   * URL Parameters:
   * - id: Menu item identifier (positive integer, required)
   *
   * Request Body:
   * - quantity: Number of units to add (positive integer, required)
   * - reason: Explanation for the addition (string, min 3 chars, required)
   *
   * Response:
   * - 200: Stock added successfully, returns updated item
   * - 400: Invalid data or UNLIMITED inventory type
   * - 401: User not authenticated
   * - 403: User lacks required permissions
   * - 404: Menu item not found
   * - 500: Server error during operation
   *
   * Response Data:
   * - Updated menu item with new stockQuantity
   * - Includes all item fields (name, price, availability, etc.)
   *
   * Validation:
   * - Item must exist
   * - Item must have TRACKED inventory type
   * - Quantity must be positive
   * - Reason must be at least 3 characters
   *
   * Business Logic:
   * - Adds quantity to current stock
   * - Creates MANUAL_ADD audit record
   * - Records user ID and timestamp
   * - If item was unavailable, becomes available again
   * - Re-evaluates low stock status
   *
   * Use Cases:
   * - Additional mid-day production
   * - High demand replenishment
   * - Inventory count corrections
   * - Stock adjustments after re-prep
   * - Manual inventory reconciliation
   *
   * Security:
   * - Requires authentication (JWT token)
   * - Requires ADMIN or MANAGER role
   * - User ID captured for accountability
   * - Operation logged in audit trail
   *
   * Example Request:
   * ```json
   * {
   *   "quantity": 15,
   *   "reason": "Additional mid-day production due to high demand"
   * }
   * ```
   */
  addStock = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: AddStockBodyInput = req.body;
    const userId = req.user?.id;

    const item = await this.itemService.addStock(id, data, userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Stock added successfully",
      data: item,
    });
  });

  /**
   * POST /items/:id/stock/remove
   *
   * Manually removes stock from a specific menu item. This endpoint is used
   * for tracking waste, spoilage, damage, or other stock reductions that
   * occur outside of normal order fulfillment.
   *
   * @param req - Express request object with item ID in params and removal data in body
   * @param res - Express response object
   *
   * URL Parameters:
   * - id: Menu item identifier (positive integer, required)
   *
   * Request Body:
   * - quantity: Number of units to remove (positive integer, required)
   * - reason: Explanation for the removal (string, min 3 chars, optional but recommended)
   *
   * Response:
   * - 200: Stock removed successfully, returns updated item
   * - 400: Invalid data, UNLIMITED type, or insufficient stock
   * - 401: User not authenticated
   * - 403: User lacks required permissions
   * - 404: Menu item not found
   * - 500: Server error during operation
   *
   * Response Data:
   * - Updated menu item with reduced stockQuantity
   * - Includes all item fields (name, price, availability, etc.)
   *
   * Validation:
   * - Item must exist
   * - Item must have TRACKED inventory type
   * - Quantity must be positive
   * - Cannot remove more than current stock
   * - Reason optional but recommended for audit
   *
   * Business Logic:
   * - Subtracts quantity from current stock
   * - Creates MANUAL_REMOVE audit record
   * - Records user ID and timestamp
   * - If stock reaches 0, item may become unavailable
   * - Triggers low stock alerts if threshold reached
   *
   * Use Cases:
   * - Food spoilage tracking
   * - Damaged items removal
   * - Quality control removals
   * - Dropped or spilled items
   * - End-of-day waste recording
   * - Inventory count corrections
   *
   * Security:
   * - Requires authentication (JWT token)
   * - Requires ADMIN or MANAGER role
   * - User ID captured for accountability
   * - Operation logged for waste analysis
   *
   * Example Request:
   * ```json
   * {
   *   "quantity": 3,
   *   "reason": "Dishes dropped during service - kitchen accident"
   * }
   * ```
   */
  removeStock = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: AddStockBodyInput = req.body;
    const userId = req.user?.id;

    const item = await this.itemService.removeStock(id, data, userId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Stock removed successfully",
      data: item,
    });
  });

  /**
   * GET /items/low-stock
   *
   * Retrieves a list of menu items that have reached or fallen below
   * their low stock alert threshold. This endpoint helps managers and
   * kitchen staff proactively manage inventory and prevent stockouts.
   *
   * @param req - Express request object
   * @param res - Express response object
   *
   * Query Parameters:
   * - None required
   *
   * Response:
   * - 200: Low stock items retrieved successfully
   * - 401: User not authenticated
   * - 403: User lacks required permissions
   * - 500: Server error during retrieval
   *
   * Response Data:
   * - Array of menu items with low stock
   * - Each item includes: id, name, stockQuantity, lowStockAlert, etc.
   * - Only TRACKED inventory type items included
   * - Excludes soft-deleted items
   *
   * Business Logic:
   * - Returns items where: stockQuantity <= lowStockAlert
   * - Only TRACKED items are included
   * - Sorted by database default order
   * - No pagination (typically small result set)
   *
   * Use Cases:
   * - Dashboard low stock alerts
   * - Manager notification system
   * - Kitchen production planning
   * - Mobile app alerts
   * - Automated restock workflows
   * - End-of-service reports
   *
   * Integration Points:
   * - Admin dashboard widgets
   * - Push notifications
   * - Email alerts
   * - Kitchen display systems
   * - Mobile management apps
   *
   * Security:
   * - Requires authentication (JWT token)
   * - Requires ADMIN, MANAGER, or WAITER role
   * - Read-only operation
   */
  getLowStock = asyncHandler(async (req: Request, res: Response) => {
    const items = await this.itemService.getLowStock();

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Low stock items fetched successfully",
      data: items,
    });
  });

  /**
   * GET /items/out-of-stock
   *
   * Retrieves a list of menu items that are completely out of stock.
   * This endpoint is critical for service staff to know what cannot be
   * ordered and for managers to prioritize production needs.
   *
   * @param req - Express request object
   * @param res - Express response object
   *
   * Query Parameters:
   * - None required
   *
   * Response:
   * - 200: Out of stock items retrieved successfully
   * - 401: User not authenticated
   * - 403: User lacks required permissions
   * - 500: Server error during retrieval
   *
   * Response Data:
   * - Array of menu items with zero stock
   * - Each item includes: id, name, stockQuantity (0), isAvailable, etc.
   * - Only TRACKED inventory type items included
   * - Excludes soft-deleted items
   *
   * Business Logic:
   * - Returns items where: stockQuantity = 0
   * - Only TRACKED items are included
   * - Items with autoMarkUnavailable=true are automatically blocked
   * - Sorted by database default order
   * - No pagination (typically small result set)
   *
   * Use Cases:
   * - Waiter/waitress dashboard display
   * - POS system item blocking
   * - Customer ordering interfaces (hide items)
   * - Kitchen production priority queue
   * - Manager critical alerts
   * - End-of-shift reports
   *
   * Staff Benefits:
   * - Waiters know what to upsell instead
   * - Kitchen knows production priorities
   * - Managers can adjust menu dynamically
   * - Customers get accurate availability info
   *
   * Integration Points:
   * - Waiter mobile apps
   * - Customer-facing digital menus
   * - POS systems
   * - Kitchen display systems
   * - Manager dashboards
   * - Real-time availability updates
   *
   * Security:
   * - Requires authentication (JWT token)
   * - Requires ADMIN, MANAGER, or WAITER role
   * - Read-only operation
   * - Critical for service operations
   */
  getOutOfStock = asyncHandler(async (req: Request, res: Response) => {
    const items = await this.itemService.getOutStock();

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Out of stock items fetched successfully",
      data: items,
    });
  });

  /**
   * GET /items/:id/stock/history
   *
   * Retrieves the complete stock adjustment history for a specific menu item.
   * This endpoint provides a detailed audit trail of all stock changes with
   * pagination support for efficient data retrieval.
   *
   * @param req - Express request object with item ID in params and pagination in query
   * @param res - Express response object
   *
   * URL Parameters:
   * - id: Menu item identifier (positive integer, required)
   *
   * Query Parameters:
   * - page: Current page number (positive integer, optional, default: 1)
   * - limit: Records per page (positive integer, optional, default: 20, max: 100)
   *
   * Response:
   * - 200: Stock history retrieved successfully
   * - 400: Invalid parameters (negative page, invalid limit, etc.)
   * - 401: User not authenticated
   * - 403: User lacks required permissions
   * - 404: Menu item not found
   * - 500: Server error during retrieval
   *
   * Response Data:
   * - data: Array of stock adjustment records
   * - meta: Pagination metadata
   *   - total: Total number of adjustments
   *   - page: Current page number
   *   - limit: Records per page
   *   - totalPages: Total number of pages
   *
   * Adjustment Record Contents:
   * - adjustmentType: DAILY_RESET, MANUAL_ADD, MANUAL_REMOVE, ORDER_DEDUCT, ORDER_CANCELLED
   * - previousStock: Stock quantity before change
   * - newStock: Stock quantity after change
   * - quantity: Amount changed (+/-)
   * - reason: Explanation for the change
   * - userId: User who made the change (if applicable)
   * - orderId: Related order (if applicable)
   * - createdAt: Timestamp of the change
   *
   * Sorting:
   * - Results sorted by createdAt DESC (newest first)
   * - Most recent adjustments appear at the top
   *
   * Use Cases:
   * - Audit trail investigation
   * - Stock discrepancy resolution
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
   *
   * Security:
   * - Requires authentication (JWT token)
   * - Requires ADMIN or MANAGER role
   * - Read-only operation
   * - Sensitive audit data
   */
  getStockHistory = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    const params: PaginationParams = { page, limit };

    const history = await this.itemService.getStockHistory(id, params);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Stock History fetched successfully",
      data: history,
    });
  });

  /**
   * PATCH /items/:id/inventory-type
   *
   * Configures the inventory tracking type for a specific menu item.
   * This endpoint determines whether an item requires stock tracking
   * (TRACKED) or has unlimited availability (UNLIMITED).
   *
   * @param req - Express request object with item ID in params and config in body
   * @param res - Express response object
   *
   * URL Parameters:
   * - id: Menu item identifier (positive integer, required)
   *
   * Request Body:
   * - inventoryType: Tracking mode ("TRACKED" | "UNLIMITED", required)
   * - lowStockAlert: Alert threshold (non-negative integer, optional)
   *
   * Response:
   * - 200: Inventory type updated successfully
   * - 400: Invalid inventory type or parameters
   * - 401: User not authenticated
   * - 403: User lacks required permissions
   * - 404: Menu item not found
   * - 500: Server error during update
   *
   * Response Data:
   * - Updated menu item with new inventoryType
   * - Includes all item fields
   * - Stock fields cleared if changed to UNLIMITED
   *
   * Inventory Type Behaviors:
   *
   * TRACKED:
   * - Stock quantity monitored
   * - Requires daily stock reset
   * - Auto-deducts on orders
   * - Can become unavailable
   * - Low stock alerts active
   * - Suitable for: Pre-prepared dishes
   *
   * UNLIMITED:
   * - No stock tracking
   * - Always available
   * - No stock deduction
   * - No alerts needed
   * - Stock fields cleared
   * - Suitable for: Bottled drinks
   *
   * Side Effects:
   * - TRACKED → UNLIMITED: Clears stockQuantity and initialStock
   * - UNLIMITED → TRACKED: Requires subsequent daily-reset
   * - Low stock alert updated if provided
   * - Item availability status preserved
   *
   * Use Cases:
   * - Initial menu item setup
   * - Menu item type conversion
   * - Seasonal inventory changes
   * - Business model adjustments
   * - Item reclassification
   *
   * Security:
   * - Requires authentication (JWT token)
   * - Requires ADMIN role
   * - Configuration change logged
   * - Critical system setting
   *
   * Example Request (TRACKED):
   * ```json
   * {
   *   "inventoryType": "TRACKED",
   *   "lowStockAlert": 5
   * }
   * ```
   *
   * Example Request (UNLIMITED):
   * ```json
   * {
   *   "inventoryType": "UNLIMITED"
   * }
   * ```
   */
  setInventoryType = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: InventoryTypeInput = req.body;

    const item = await this.itemService.setInventoryType(id, data);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Inventory Type updated successfully",
      data: item,
    });
  });
}

export default new ItemController(itemService);
