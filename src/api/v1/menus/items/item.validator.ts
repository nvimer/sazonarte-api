import { z } from "zod";
import { idParamsSchema } from "../../../../utils/params.schema";

/**
 * Validation schema for meny item ID parameters.
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

/*
 * Validation schema for search/filter parameters
 * Used for filtering menu items by name or other criteria
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

/** Typescript type definitions derived from the validation schemas.
 * These types ensure type safety throughout the application.
 */
export type MenuItemIdParams = z.infer<typeof menuItemIdSchema>["params"];
export type CreateItemInput = z.infer<typeof createItemSchema>["body"];
export type MenuItemSearchParams = z.infer<
  typeof menuItemSearchSchema
>["query"];
