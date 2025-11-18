import { Router } from "express";
import itemController from "./item.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import {
  addStockSchema,
  createItemSchema,
  dailyStockResetSchema,
  inventoryTypeSchema,
  menuItemIdSchema,
  menuItemSearchSchema,
  removeStockSchema,
  stockHistorySchema,
} from "./item.validator";
import { paginationQuerySchema } from "../../../../utils/pagination.schema";
import { authJwt } from "../../../../middlewares/auth.middleware";

/**
 * This router defines all CRUD operations for menu items:
 * - POST / - Create a new menu item
 * - GET / - Retrieve paginated list of menu items
 * - GET /search - Search menu items with filtering
 * - GET /:id - Retrieve a specific menu item by ID
 * - PATCH /:id - Update an existing menu item
 * - DELETE /:id - Soft delete a menu item
 * - DELETE /bulk - Bulk soft delete menu items
 *
 * Menu Item Operations:
 * - Item creation with category association
 * - Item listing with pagination and filtering
 * - Item search by name, description, or category
 * - Item updates with validation
 * - Item deletion (soft delete)
 * - Bulk operations for efficiency
 * - Register daily stock
 * - Item listing of items with low stock
 * - Item listing of items withoutstock
 * - Add Stock to item by id
 * - Remove Stock of item by id.
 * - Item listing history
 *
 * Validation Features:
 * - Input sanitization and type checking
 * - Required field validation
 * - Data format validation
 * - Business rule enforcement
 * - Duplicate prevention
 */
const router = Router();

/**
 * GET /items
 *
 * Retrieves a paginated list of all Menu-Items in the system.
 * This endpoint supports pagination parameters for efficient
 * data retrieval and display
 *
 * Validation:
 * - paginationQuerySchema: Validates pagination query parameters
 *
 * Response:
 * - 200: Menu-Items retrieved successfully with pagination metadata
 * - 400: Invalid pagination parameters
 * - 500: Server error during retrieval
 */
router.get("/", validate(paginationQuerySchema), itemController.getMenuItems);

/*
 * GET /items/search
 *
 * Searches for menu items with optional filtering and pagination.
 *
 * Query Parameters:
 * - page: Page number for pagintion (optional, defaults to 1)
 * - limit: Number of item s per page (optional, defaults to 10)
 * - search: Search term for name-based filtering (optional)
 * - active: Filter by active status (true/false, optional)
 */
router.get(
  "/search",
  validate(menuItemSearchSchema),
  validate(paginationQuerySchema),
  itemController.searchMenuItems,
);

/**
 * POST /items
 *
 * Creates a new menu item in the system with the provided information.
 * This endpoint handles menu item creation with comprehensive validation
 * and ensures proper data structure and business rules.
 *
 * Validation:
 * - createItemSchema: Validates required fields, data types, and business rules
 * - Category existence validation
 * - Price range validation
 * - Name uniqueness within category
 * - URL format validation for images
 */
router.post("/", validate(createItemSchema), itemController.postItem);

/**
 * POST /items/stock/daily-reset
 *
 * Register a initial stock of the day. The system creates a new stock every day with
 * value provided for admin
 *
 * This endpoint handles menu item stock reset with comprehensive Validation
 * and ensure proper data structure and business rules.
 *
 * Validation:
 * - dailyStockResetSchema: Validates required fields, data types and  business rules.
 * - items: is an array
 * - itemId: is a positive number.
 * - quantity: is a number min 0 or greater
 * - lowStockAlert: is a number, is an optional value
 */
router.post(
  "/stock/daily-reset",
  validate(dailyStockResetSchema),
  itemController.dailyStockReset,
);

/**
 * GET /items/:id
 *
 * Retrieves a specific menu item by its ID
 */
router.get("/:id", validate(menuItemIdSchema), itemController.getMenuItem);

/**
 * GET /items/low-stock
 *
 * Retrieves a list of items with low stock.
 */
router.get("/low-stock", authJwt, itemController.getLowStock);

/**
 * GET /items/out-of-stock
 *
 * Retrieves a list of items without stock.
 */
router.get("/out-of-stock", authJwt, itemController.getOutOfStock);

/**
 * POST /items/:id/stock/add
 *
 * Creates a new daily stock. This operation only has been manage for admin user. This user
 * update every day of items.
 *
 * Validation:
 * - addStockSchema: Validates required fields, data types, and business rules
 * - quantity existence and positive number validation
 * - reason string validation and optional value
 */
router.post(
  "/:id/stock/add",
  authJwt,
  validate(addStockSchema),
  itemController.addStock,
);

/**
 * POST /items/:id/stock/remove
 *
 * Remove stock manually.
 *
 * This operation can be restore stock of item by id.
 *
 * Validation:
 * - removeStockSchema Validates required fields, data types and business rules.
 * - quantity existence and positive number validation
 * - reason string validation and optiona value
 */
router.post(
  "/:id/stock/remove",
  authJwt,
  validate(removeStockSchema),
  itemController.removeStock,
);

/**
 * GET /items/:id/stock/history
 *
 * Get a adjusment history of a item by his id.
 *
 * Validation:
 * - inventoryTypeSchema validates required fields, data types and bussiness rules
 * - inventoryType enum validation
 * - lowStockAlert must be positive number, optional value.
 */
router.get(
  "/:id/stock/history",
  validate(stockHistorySchema),
  itemController.getStockHistory,
);

/**
 * PATCH /items/:id/inventory-type
 *
 * Configure inventory type of item by id
 *
 * Validation:
 * - inventoryTypeSchema validates required field, data types and business rules
 * - inventoryType enum validate
 * - lowStockAlert number positive validation. Optional value
 */
router.get(
  "/:id/inventory-type",
  validate(inventoryTypeSchema),
  itemController.setInventoryType,
);

export default router;
