import { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { CategoryServiceInterface } from "./interfaces/category.service.interface";
import {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
} from "./category.validator";
import { HttpStatus } from "../../../../utils/httpStatus.enum";
import categoryService from "./category.service";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";
import { logger } from "../../../../config/logger";

/**
 * Controller class responsible for handling HTTP requests related to menu categories.
 * Provides CRUD operations for menu categories through RESTful endpoints.
 */
class CategoryController {
  constructor(private categoryService: CategoryServiceInterface) {}

  /**
   * GET /categories - Retrieves a paginated list of all menu categories
   *
   * @param req - Express request object containing query parameters for pagination
   * @param res - Express response object to send the response
   *
   * Query Parameters:
   * - page: Page number for pagination (default: DEFAULT_PAGE)
   * - limit: Number of items per page (default: DEFAULT_LIMIT)
   *
   * Returns:
   * - HTTP 200 with paginated categories data
   * - Success message and categories array
   */
  getCategories = asyncHandler(async (req: Request, res: Response) => {
    // Extract pagination parameters from query string with fallback to defaults
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const limit = Number(req.query.limit) || DEFAULT_LIMIT;

    // Create pagination parameters object
    const params: PaginationParams = { page, limit };

    // Fetch categories from service layer with pagination
    const categories = await this.categoryService.findCategories(params);

    // Return successful response with categories data
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Menu Categories fetched successfully",
      data: categories,
    });
  });

  /**
   * GET /categories/:id - Retrieves a specific menu category by its ID
   *
   * @param req - Express request object containing the category ID in params
   * @param res - Express response object to send the response
   *
   * URL Parameters:
   * - id: The unique identifier of the category to retrieve
   *
   * Returns:
   * - HTTP 200 with the specific category data
   * - Success message and category object
   *
   * Throws:
   * - 404 if category is not found (handled by service layer)
   */
  getCategory = asyncHandler(async (req: Request, res: Response) => {
    // Extract and convert category ID from URL parameters
    const id = Number(req.params.id);
    logger.info(`here is id ${id}`);

    // Fetch specific category from service layer
    const menuCategory = await this.categoryService.findCategoryById(id);

    // Return successful response with category data
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Menu Category fetched successfully",
      data: menuCategory,
    });
  });

  /**
   * POST /categories - Creates a new menu category
   *
   * @param req - Express request object containing category data in body
   * @param res - Express response object to send the response
   *
   * Request Body:
   * - CreateMenuCategoryInput: Validated category creation data
   *
   * Returns:
   * - HTTP 201 (Created) with the newly created category
   * - Success message and created category object
   *
   * Throws:
   * - 400 if validation fails (handled by validator middleware)
   * - 409 if category with same name already exists (handled by service layer)
   */
  postCategory = asyncHandler(async (req: Request, res: Response) => {
    // Extract validated category data from request body
    const data: CreateMenuCategoryInput = req.body;

    // Create new category through service layer
    const menuCategory = await this.categoryService.createCategory(data);

    // Return successful response with created category
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Menu Category created successfully",
      data: menuCategory,
    });
  });

  /**
   * PATCH /categories/:id - Updates an existing menu category
   *
   * @param req - Express request object containing category ID in params and update data in body
   * @param res - Express response object to send the response
   *
   * URL Parameters:
   * - id: The unique identifier of the category to update
   *
   * Request Body:
   * - UpdateMenuCategoryInput: Validated category update data (partial)
   *
   * Returns:
   * - HTTP 202 (Accepted) with the updated category
   * - Success message and updated category object
   *
   * Throws:
   * - 400 if validation fails (handled by validator middleware)
   * - 404 if category is not found (handled by service layer)
   * - 409 if update would create duplicate name (handled by service layer)
   */
  patchCategory = asyncHandler(async (req: Request, res: Response) => {
    // Extract validated update data from request body
    const data: UpdateMenuCategoryInput = req.body;

    // Extract and convert category ID from URL parameters
    const id = Number(req.params.id);

    // Update category through service layer
    const updatedCategory = await this.categoryService.updateCategory(id, data);

    // Return successful response with updated category
    res.status(HttpStatus.ACCEPTED).json({
      success: true,
      message: "Menu Category updated successfully",
      data: updatedCategory,
    });
  });
}

// Export a singleton instance of the controller with injected service dependency
export default new CategoryController(categoryService);
