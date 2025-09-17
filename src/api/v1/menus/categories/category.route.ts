import { Router } from "express";
import categoryController from "./category.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { authJwt } from "../../../../middlewares/auth.middleware";
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
 */
const router = Router();

/**
 * GET /categories
 *
 * Retrieves a paginated list of all menu categories.
 *
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
 */
router.get("/:id", validate(categoryIdSchema), categoryController.getCategory);

/**
 * PATCH /categories/:id
 *
 * Updates an existing menu category.
 *
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
 */
router.delete(
  "/bulk",
  authJwt,
  validate(bulkCategorySchema),
  categoryController.bulkDeleteCategories,
);

export default router;
