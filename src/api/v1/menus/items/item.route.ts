import { Router } from "express";
import itemController from "./item.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { createItemSchema } from "./item.validator";

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
 * POST /menu-items
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

export default router;
