import { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { ItemServiceInteface } from "./interfaces/item.service.interface";
import { CreateItemInput, MenuItemSearchParams } from "./item.validator";
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
  constructor(private itemService: ItemServiceInteface) {}

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
      data: menuItems,
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
}

export default new ItemController(itemService);
