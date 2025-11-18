import { z } from "zod";
import { idParamsSchema } from "../../../../utils/params.schema";
import { InventoryType } from "../../../../types/prisma.types";

/**
 * Inventory Type Enumeration Validation
 *
 * Creates a Zod enum from InventoryType to ensure only valid
 * inventory type values are accepted in API requests.
 *
 * Valid Inventory Type Values:
 * - 'TRACKED': Item has limited daily stock that needs tracking
 * - 'UNLIMITED': Item has unlimited availability (e.g., bottled drinks)
 *
 * Use Cases:
 * - Menu item inventory configuration
 * - Stock management system setup
 * - Inventory type switching operations
 * - Daily stock reset filtering
 *
 * Business Rules:
 * - Only TRACKED items can have stock adjustments
 * - UNLIMITED items skip stock validation in orders
 * - TRACKED items auto-block when stock reaches zero
 * - Stock alerts only apply to TRACKED items
 */
const inventoryType = z.enum(
  Object.values(InventoryType) as [InventoryType, ...InventoryType[]],
);

/**
 * Validation Schema for Menu Item ID Parameters
 *
 * Validates the ID parameter in URL paths for menu item operations.
 * This schema ensures the ID is a valid integer format before processing.
 *
 * Validation Rules:
 * - ID must be present in URL params
 * - ID must be a valid number
 * - ID must be a positive integer
 *
 * Use Cases:
 * - GET /items/:id (retrieve specific item)
 * - PATCH /items/:id (update item)
 * - DELETE /items/:id (soft delete item)
 * - POST /items/:id/stock/add (add stock)
 * - POST /items/:id/stock/remove (remove stock)
 * - GET /items/:id/stock/history (get stock history)
 *
 * Error Handling:
 * - Returns 400 if ID format is invalid
 * - Returns 404 if item doesn't exist (handled by service layer)
 */
export const menuItemIdSchema = z.object({
  params: idParamsSchema,
});

/**
 * Menu item creation validation schema
 *
 * Validates the request body for menu item creation operations.
 * This schema ensures all required fields are present and meet
 * the specified validation criteria for creating new menu items.
 *
 * Validation Rules:
 * - name: Must be a non-empty string (item name/identifier)
 * - description: Must be a string (item description)
 * - categoryId: Must be a valid number (associated category ID)
 * - price: Must be a valid number (item price)
 * - isExtra: Must be a boolean (indicates if item is an extra/add-on)
 * - isAvailable: Must be a boolean (item availability status)
 * - imageUrl: Must be a string (item image URL)
 *
 * Error Messages:
 * - name: "Item name is required"
 * - description: "Item description is required"
 * - categoryId: "Category ID must be a valid number"
 * - price: "Price must be a valid number"
 * - isExtra: "isExtra must be a boolean"
 * - isAvailable: "isAvailable must be a boolean"
 * - imageUrl: "Image URL is required"
 *
 * Data Integrity:
 * - Category ID validation (should reference existing category)
 * - Price validation (should be positive number)
 * - Name uniqueness validation within category
 * - Required fields validation
 *
 * Use Cases:
 * - POST /items endpoint
 * - Menu item creation forms
 * - New dish addition
 * - Menu expansion
 * - Special offer items
 *
 * Business Rules:
 * - Item must be associated with a valid category
 * - Price should be a positive number
 * - Item name should be unique within its category
 * - Image URL should be a valid URL format
 * - Availability status controls item visibility
 * - Extra flag indicates add-on items
 */
export const createItemSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string(),
    categoryId: z.coerce.number(),
    price: z.coerce.number(),
    isExtra: z.boolean(),
    isAvailable: z.boolean(),
    imageUrl: z.string().optional(),
  }),
});

/**
 * Validation Schema for Menu Item Search Parameters
 *
 * Validates query parameters for menu item search and filtering operations.
 * Supports text-based search and boolean status filtering with proper
 * sanitization and type transformation.
 *
 * Query Parameters:
 * - search: Text search term (optional)
 *   - Min length: 1 character
 *   - Max length: 100 characters
 *   - Automatically trimmed
 *   - Searches in: name, description fields
 *
 * - active: Active status filter (optional)
 *   - Accepts: "true" or "false" strings
 *   - Transforms to boolean automatically
 *   - Filters items by isAvailable status
 *
 * Search Behavior:
 * - Case-insensitive matching
 * - Partial text matching (contains)
 * - Works with pagination
 * - Returns soft-deleted items excluded
 *
 * Use Cases:
 * - Restaurant menu search interface
 * - Admin item management filtering
 * - Customer menu browsing
 * - Inventory management searches
 * - Active/inactive item filtering
 *
 * Example Queries:
 * - /items/search?search=pizza
 * - /items/search?active=true
 * - /items/search?search=soup&active=false&page=2&limit=20
 */
export const menuItemSearchSchema = z.object({
  query: z.object({
    search: z
      .string()
      .min(1, "Search term must be at least 1 character")
      .max(100, "Search term cannot exceed 100 characters")
      .trim()
      .optional(),
    active: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});

/**
 * Validation Schema for Daily Stock Reset Operation
 *
 * Validates the request body for daily stock initialization.
 * This operation is typically performed at the start of each business day
 * to set the initial stock quantities for pre-prepared dishes.
 *
 * Request Body Structure:
 * - items: Array of stock items to initialize
 *   - Minimum: 1 item required
 *   - Maximum: Unlimited (batching supported)
 *
 * Item Properties:
 * - itemId: Menu item identifier
 *   - Type: Positive integer
 *   - Must reference existing menu item
 *   - Must be TRACKED inventory type
 *
 * - quantity: Initial stock quantity for the day
 *   - Type: Non-negative integer
 *   - Minimum: 0 (item can start at zero stock)
 *   - Represents: Number of portions/servings prepared
 *
 * - lowStockAlert: Stock threshold for alerts (optional)
 *   - Type: Non-negative integer
 *   - Default: 5 (if not specified)
 *   - Triggers low stock notifications
 *
 * Business Rules:
 * - Only TRACKED items can have stock reset
 * - UNLIMITED items will be rejected
 * - All items must exist in database
 * - Previous stock values are stored in history
 * - Items are automatically marked as available
 * - Stock adjustments are logged for audit trail
 *
 * Use Cases:
 * - Morning stock initialization
 * - Daily operations start
 * - Kitchen prep completion
 * - Inventory count updates
 * - Multiple item batch processing
 */
export const dailyStockResetSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          itemId: z.number().int().positive("Item ID must be positive"),
          quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
          lowStockAlert: z.number().int().min(0).optional(),
        }),
      )
      .min(1, "At least one item must be provided"),
  }),
});

/**
 * Validation Schema for Manual Stock Addition
 *
 * Validates requests to manually add stock to a menu item.
 * This operation is used for mid-day stock additions, such as
 * additional production runs or inventory corrections.
 *
 * URL Parameters:
 * - id: Menu item identifier (validated by idParamsSchema)
 *   - Must be positive integer
 *   - Must reference existing TRACKED item
 *
 * Request Body:
 * - quantity: Number of units to add
 *   - Type: Positive integer (must be > 0)
 *   - Represents: Additional portions/servings
 *   - Added to current stock quantity
 *
 * - reason: Explanation for stock addition
 *   - Type: String
 *   - Min length: 3 characters
 *   - Required for audit trail
 *   - Examples: "Additional production", "Morning batch completed"
 *
 * Business Rules:
 * - Only TRACKED items can have stock added
 * - UNLIMITED items will be rejected
 * - Item must exist and not be deleted
 * - Reason is mandatory for accountability
 * - Operation is logged in stock adjustment history
 * - User ID is automatically captured (req.user)
 * - Timestamp is automatically recorded
 *
 * Stock Behavior:
 * - New stock = Current stock + Added quantity
 * - If item was unavailable (out of stock), it becomes available again
 * - Low stock alerts are re-evaluated
 *
 * Use Cases:
 * - Mid-day production additions
 * - Inventory corrections (count adjustments)
 * - Additional prep due to demand
 * - Stock replenishment during service
 * - Manual inventory reconciliation
 */
export const addStockSchema = z.object({
  params: idParamsSchema,
  body: z.object({
    quantity: z.number().int().positive("Quantity must be positive"),
    reason: z.string().min(3, "Reason must be at least 3 characters"),
  }),
});

/**
 * Validation Schema for Manual Stock Removal
 *
 * Validates requests to manually remove stock from a menu item.
 * This operation is used for spoilage, damage, waste, or other
 * reductions that occur outside of normal order fulfillment.
 *
 * URL Parameters:
 * - id: Menu item identifier (validated by idParamsSchema)
 *   - Must be positive integer
 *   - Must reference existing TRACKED item
 *
 * Request Body:
 * - quantity: Number of units to remove
 *   - Type: Positive integer (must be > 0)
 *   - Represents: Portions/servings to deduct
 *   - Cannot exceed current stock quantity
 *   - Subtracted from current stock
 *
 * - reason: Explanation for stock removal (optional but recommended)
 *   - Type: String
 *   - Min length: 3 characters
 *   - Important for audit and waste tracking
 *   - Examples: "Spoiled items", "Dropped plates", "Quality issue"
 *
 * Business Rules:
 * - Only TRACKED items can have stock removed
 * - UNLIMITED items will be rejected
 * - Item must exist and not be deleted
 * - Cannot remove more than current stock
 * - Reason helps with waste analysis
 * - Operation is logged in stock adjustment history
 * - User ID is automatically captured (req.user)
 * - Timestamp is automatically recorded
 *
 * Stock Behavior:
 * - New stock = Current stock - Removed quantity
 * - If stock reaches 0 and autoMarkUnavailable=true, item becomes unavailable
 * - Low stock alerts are triggered if threshold reached
 * - Cannot create negative stock (validation enforced)
 *
 * Use Cases:
 * - Food spoilage/waste tracking
 * - Damaged items removal
 * - Quality control removals
 * - Inventory corrections (count adjustments)
 * - Dropped or spilled items
 * - End-of-day waste recording
 *
 * Error Scenarios:
 * - 400: Insufficient stock to remove
 * - 400: Cannot remove from UNLIMITED items
 * - 404: Item not found
 */
export const removeStockSchema = z.object({
  params: idParamsSchema,
  body: z.object({
    quantity: z.number().int().positive("Quantity must be positive"),
    reason: z
      .string()
      .min(3, "Reason must be at least 3 characters")
      .optional(),
  }),
});

/**
 * Validation Schema for Inventory Type Configuration
 *
 * Validates requests to configure or change the inventory tracking
 * type for a menu item. This determines whether the item requires
 * stock tracking or has unlimited availability.
 *
 * URL Parameters:
 * - id: Menu item identifier (validated by idParamsSchema)
 *   - Must be positive integer
 *   - Must reference existing item
 *
 * Request Body:
 * - inventoryType: Inventory tracking mode
 *   - Type: Enum ("TRACKED" | "UNLIMITED")
 *   - Required field
 *   - Determines stock behavior for the item
 *
 * - lowStockAlert: Stock threshold for alerts (optional)
 *   - Type: Non-negative integer
 *   - Only applicable when inventoryType = "TRACKED"
 *   - Default: 5 (if not specified)
 *   - Triggers notifications when stock <= this value
 *
 * Inventory Type Behaviors:
 *
 * TRACKED:
 * - Stock quantity is monitored
 * - Auto-deducts on orders
 * - Can go out of stock
 * - Requires daily stock reset
 * - Low stock alerts enabled
 * - Auto-blocks when stock = 0
 * - Suitable for: Pre-prepared dishes, limited portions
 *
 * UNLIMITED:
 * - No stock tracking
 * - Always available
 * - No stock deduction on orders
 * - No daily reset needed
 * - No stock alerts
 * - Stock fields reset to null
 * - Suitable for: Bottled drinks, unlimited items
 *
 * Business Rules:
 * - Item must exist and not be deleted
 * - Changing to UNLIMITED clears stock values
 * - Changing from UNLIMITED to TRACKED requires initial stock setup
 * - Configuration change is logged for audit
 *
 * Side Effects:
 * - TRACKED → UNLIMITED: Clears stockQuantity and initialStock
 * - UNLIMITED → TRACKED: Requires subsequent daily-reset call
 * - Low stock alert is updated if provided
 * - Item availability status preserved
 *
 * Use Cases:
 * - Initial item setup
 * - Menu item type conversion
 * - Seasonal inventory changes
 * - Business model adjustments
 * - Item classification updates
 */
export const inventoryTypeSchema = z.object({
  params: idParamsSchema,
  body: z.object({
    inventoryType: inventoryType,
    lowStockAlert: z.number().int().min(0).optional(),
  }),
});

/**
 * Validation Schema for Stock History Query Parameters
 *
 * Validates query parameters for retrieving the stock adjustment
 * history of a specific menu item. Supports pagination for efficient
 * data retrieval and display of historical stock movements.
 *
 * URL Parameters:
 * - id: Menu item identifier (validated by idParamsSchema)
 *   - Must be positive integer
 *   - Must reference existing item
 *
 * Query Parameters:
 * - page: Current page number
 *   - Type: Positive integer
 *   - Default: 1
 *   - Minimum: 1
 *   - Used for pagination offset calculation
 *
 * - limit: Number of records per page
 *   - Type: Positive integer
 *   - Default: 20
 *   - Minimum: 1
 *   - Maximum: 100 (prevents excessive data retrieval)
 *
 * History Record Contents:
 * Each record includes:
 * - Adjustment type (DAILY_RESET, MANUAL_ADD, ORDER_DEDUCT, etc.)
 * - Previous stock quantity
 * - New stock quantity
 * - Quantity changed (+/-)
 * - Reason/description
 * - User ID (who made the change)
 * - Order ID (if related to an order)
 * - Timestamp (when change occurred)
 *
 * Sorting:
 * - Results are sorted by createdAt DESC (newest first)
 * - Most recent adjustments appear at the top
 *
 * Use Cases:
 * - Audit trail review
 * - Stock discrepancy investigation
 * - Waste tracking analysis
 * - Order fulfillment verification
 * - Employee activity monitoring
 * - Inventory reconciliation
 * - Historical trend analysis
 *
 * Response Structure:
 * - data: Array of stock adjustment records
 * - meta: Pagination metadata
 *   - total: Total number of records
 *   - page: Current page
 *   - limit: Records per page
 *   - totalPages: Total number of pages
 *
 * Example Query:
 * GET /items/123/stock/history?page=1&limit=20
 */
export const stockHistorySchema = z.object({
  params: idParamsSchema,
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

/** Typescript type definitions derived from the validation schemas.
 * These types ensure type safety throughout the application.
 */
export type MenuItemIdParams = z.infer<typeof menuItemIdSchema>["params"];
export type CreateItemInput = z.infer<typeof createItemSchema>["body"];
export type MenuItemSearchParams = z.infer<
  typeof menuItemSearchSchema
>["query"];
export type DailyStockResetInput = z.infer<
  typeof dailyStockResetSchema
>["body"];
export type AddStockInput = z.infer<typeof addStockSchema>;
export type AddStockBodyInput = z.infer<typeof addStockSchema>["body"];
export type RemoveStockInput = z.infer<typeof removeStockSchema>;
export type RemoveStockBodyInput = z.infer<typeof removeStockSchema>["body"];
export type InventoryTypeInput = z.infer<typeof inventoryTypeSchema>["body"];
export type StockHistoryParams = z.infer<typeof stockHistorySchema>["query"];
