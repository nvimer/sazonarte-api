import { Router } from "express";
import itemController from "./item.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import {
  createItemSchema,
  menuItemIdSchema,
  menuItemSearchSchema,
} from "./item.validator";
import { paginationQuerySchema } from "../../../../utils/pagination.schema";

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
 * GET /items/:id
 *
 * Retrieves a specific menu item by its ID
 */
router.get("/:id", validate(menuItemIdSchema), itemController.getMenuItem);

export default router;
