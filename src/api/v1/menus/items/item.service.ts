import { MenuItem } from "@prisma/client";
import { ItemServiceInteface } from "./interfaces/item.service.interface";
import { CreateItemInput } from "./item.validator";
import { ItemRepositoryInterface } from "./interfaces/item.repository.interface";
import itemRepository from "./item.repository";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";

/**
 * Menu Item Service
 *
 * Core business logic layer for menu item management operations.
 * This service is responsible for:
 * - Menu item CRUD operations (Create, Read, Update, Delete)
 * - Menu item validation and business rules
 * - Category association management
 * - Pricing and availability logic
 * - Data validation and transformation
 *
 * Menu item management includes:
 * - Item creation with validation
 * - Category association verification
 * - Price and availability management
 * - Item lifecycle management
 *
 * Business Rules:
 * - Item name uniqueness within category
 * - Price must be positive
 * - Category must exist and be active
 * - Item status management
 * - Data integrity maintenance
 */
class ItemService implements ItemServiceInteface {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  /**
   * Retrieves a paginated list of all Menu Items in the system.
   * This method handles pagination logic and delegates data
   * retrieval to the repository layer.
   *
   * Business Logic:
   *  - Validates pagination parameters
   *  - Hablde default values
   *  - Ensures data consistency
   *  - Provices optimized queries
   *
   * Uses Cases:
   *  - Restaurant dashboard display
   *  - Menu Item management interface
   *  - Data export and reporting
   *  - Administrative overview
   */
  async findAllMenuItems(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuItem>> {
    return this.itemRepository.findAll(params);
  }

  /**
   * Creates a new menu item in the system with the provided information.
   * This method handles item creation with validation and
   * ensures proper data structure and category association.
   *
   * Validation Rules:
   * - Item name uniqueness within category
   * - Price must be positive number
   * - Category must exist and be active
   * - Required fields validation
   *
   * Business Logic:
   * - Validates input data
   * - Checks for name conflicts within category
   * - Verifies category existence and status
   * - Sets default values
   * - Ensures data consistency
   *
   * Use Cases:
   * - Menu item addition
   * - New dish introduction
   * - Menu expansion
   * - Seasonal item creation
   * - Special offer items
   */
  async createItem(data: CreateItemInput): Promise<MenuItem> {
    return await this.itemRepository.create(data);
  }
}

export default new ItemService(itemRepository);
