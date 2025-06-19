import { Router } from "express";
import categoryController from "./category.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import {
  categoryIdSchema,
  createMenuCategorySchema,
  updateMenuCategorySchema,
  categorySearchSchema,
  bulkCategorySchema,
} from "./category.validator";
import { paginationQuerySchema } from "../../../../utils/pagination.schema";

/**
 * Express Router for Menu Category endpoints.
 *
 * This router defines all CRUD operations for menu categories:
 * - GET / - Retrieve paginated list of categories
 * - GET /search - Search categories with filtering
 * - POST / - Create a new category
 * - GET /:id - Retrieve a specific category by ID
 * - PATCH /:id - Update an existing category
 * - DELETE /:id - Soft delete a category
 * - DELETE /bulk - Bulk soft delete categories
 *
 * All routes include appropriate validation middleware to ensure
 * data integrity and proper error handling.
 */
const router = Router();

/**
 * GET /categories
 *
 * Retrieves a paginated list of all menu categories.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 *
 * Validation:
 * - paginationQuerySchema: Validates pagination query parameters
 *
 * Response:
 * - 200: Success with paginated categories data
 * - 400: Invalid pagination parameters
 *
 * Example: GET /categories?page=1&limit=20
 */
router.get(
  "/",
  validate(paginationQuerySchema),
  categoryController.getCategories,
);

/**
 * GET /categories/search
 *
 * Searches for menu categories with optional filtering and pagination.
 *
 * Query Parameters:
 * - page: Page number for pagination (optional, defaults to 1)
 * - limit: Number of items per page (optional, defaults to 10)
 * - search: Search term for name-based filtering (optional)
 * - active: Filter by active status (true/false, optional)
 *
 * Validation:
 * - categorySearchSchema: Validates search and filter parameters
 * - paginationQuerySchema: Validates pagination parameters
 *
 * Response:
 * - 200: Success with filtered and paginated categories data
 * - 400: Invalid search or pagination parameters
 *
 * Example: GET /categories/search?search=main&active=true&page=1&limit=10
 */
router.get(
  "/search",
  validate(categorySearchSchema),
  validate(paginationQuerySchema),
  categoryController.searchCategories,
);

/**
 * POST /categories
 *
 * Creates a new menu category.
 *
 * Request Body:
 * - name: Category name (string, min 3 characters, max 100)
 * - description: Category description (string, max 500, optional)
 * - order: Display order (number, 0-999)
 *
 * Validation:
 * - createMenuCategorySchema: Validates required fields and data types
 *
 * Response:
 * - 201: Category created successfully
 * - 400: Invalid request body
 * - 409: Category with same name already exists
 *
 * Example:
 * POST /categories
 * {
 *   "name": "Main Dishes",
 *   "description": "Primary meal options",
 *   "order": 1
 * }
 */
router.post(
  "/",
  validate(createMenuCategorySchema),
  categoryController.postCategory,
);

/**
 * GET /categories/:id
 *
 * Retrieves a specific menu category by its ID.
 *
 * URL Parameters:
 * - id: Category ID (number)
 *
 * Validation:
 * - categoryIdSchema: Validates ID parameter format
 *
 * Response:
 * - 200: Category found and returned
 * - 400: Invalid ID format
 * - 404: Category not found
 *
 * Example: GET /categories/123
 */
router.get("/:id", validate(categoryIdSchema), categoryController.getCategory);

/**
 * PATCH /categories/:id
 *
 * Updates an existing menu category.
 *
 * URL Parameters:
 * - id: Category ID (number)
 *
 * Request Body (all fields optional, but at least one required):
 * - name: Category name (string, min 3 characters, max 100)
 * - description: Category description (string, max 500)
 * - order: Display order (number, 0-999)
 *
 * Validation:
 * - categoryIdSchema: Validates ID parameter format
 * - updateMenuCategorySchema: Validates request body (partial update)
 *
 * Response:
 * - 202: Category updated successfully
 * - 400: Invalid request body or ID format
 * - 404: Category not found
 * - 409: Update would create duplicate name
 *
 * Example:
 * PATCH /categories/123
 * {
 *   "name": "Updated Main Dishes",
 *   "order": 2
 * }
 */
router.patch(
  "/:id",
  validate(categoryIdSchema),
  validate(updateMenuCategorySchema),
  categoryController.patchCategory,
);

/**
 * DELETE /categories/:id
 *
 * Soft deletes a menu category by setting the deleted flag to true.
 *
 * URL Parameters:
 * - id: Category ID (number)
 *
 * Validation:
 * - categoryIdSchema: Validates ID parameter format
 *
 * Response:
 * - 200: Category soft deleted successfully
 * - 400: Invalid ID format or category already deleted
 * - 404: Category not found
 *
 * Example: DELETE /categories/123
 */
router.delete(
  "/:id",
  validate(categoryIdSchema),
  categoryController.deleteCategory,
);

/**
 * DELETE /categories/bulk
 *
 * Soft deletes multiple menu categories in bulk.
 *
 * Request Body:
 * - ids: Array of category IDs to delete (1-100 IDs)
 *
 * Validation:
 * - bulkCategorySchema: Validates array of category IDs
 *
 * Response:
 * - 200: Categories bulk deleted successfully
 * - 400: Invalid request body or no valid IDs provided
 *
 * Example:
 * DELETE /categories/bulk
 * {
 *   "ids": [1, 2, 3, 4, 5]
 * }
 */
router.delete(
  "/bulk",
  validate(bulkCategorySchema),
  categoryController.bulkDeleteCategories,
);

export default router;
