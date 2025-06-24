import { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { ItemServiceInteface } from "./interfaces/item.service.interface";
import { CreateItemInput } from "./item.validator";
import { HttpStatus } from "../../../../utils/httpStatus.enum";
import itemService from "./item.service";

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
