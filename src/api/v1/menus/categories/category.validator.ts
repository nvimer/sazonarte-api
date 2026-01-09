import { z } from "zod";
import { idParamsSchema } from "../../../../utils/params.schema";

/**
 * Validation schema for category ID parameters.
 * Used for routes that require a category ID in the URL parameters.
 */
export const categoryIdSchema = z.object({
  params: idParamsSchema,
});

/**
 * Validation schema for creating a new menu category.
 * Validates all required fields with appropriate constraints.
 */
export const createMenuCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Category name is required",
        invalid_type_error: "Category name must be a string",
      })
      .min(3, "Category name must be at least 3 characters long")
      .max(100, "Category name cannot exceed 100 characters")
      .trim()
      .refine((val) => val.length > 0, "Category name cannot be empty"),
    description: z
      .string({
        required_error: "Category description is required",
        invalid_type_error: "Category description must be a string",
      })
      .min(1, "Category description cannot be empty")
      .max(500, "Category description cannot exceed 500 characters")
      .trim()
      .optional()
      .default(""),
    order: z.coerce
      .number({
        required_error: "Category order is required",
        invalid_type_error: "Category order must be a number",
      })
      .int("Category order must be an integer")
      .min(0, "Category order must be 0 or greater")
      .max(999, "Category order cannot exceed 999"),
  }),
});

/**
 * Validation schema for updating an existing menu category.
 * All fields are optional for partial updates.
 */
export const updateMenuCategorySchema = z.object({
  body: z
    .object({
      name: z
        .string({
          invalid_type_error: "Category name must be a string",
        })
        .min(3, "Category name must be at least 3 characters long")
        .max(100, "Category name cannot exceed 100 characters")
        .trim()
        .optional(),
      description: z
        .string({
          invalid_type_error: "Category description must be a string",
        })
        .min(1, "Category description cannot be empty")
        .max(500, "Category description cannot exceed 500 characters")
        .trim()
        .optional(),
      order: z.coerce
        .number({
          invalid_type_error: "Category order must be a number",
        })
        .int("Category order must be an integer")
        .min(0, "Category order must be 0 or greater")
        .max(999, "Category order cannot exceed 999")
        .optional(),
    })
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

/**
 * Validation schema for search/filter parameters.
 * Used for filtering categories by name or other criteria.
 */
export const categorySearchSchema = z.object({
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
 * Validation schema for bulk operations.
 * Used for bulk create, update, or delete operations.
 */
export const bulkCategorySchema = z.object({
  body: z.object({
    ids: z
      .array(z.number().int().positive())
      .min(1, "At least one category ID must be provided")
      .max(100, "Cannot process more than 100 categories at once"),
  }),
});

export type MenuCategoryIdParams = z.infer<typeof categoryIdSchema>["params"];
export type CreateMenuCategoryInput = z.infer<
  typeof createMenuCategorySchema
>["body"];
export type UpdateMenuCategoryInput = z.infer<
  typeof updateMenuCategorySchema
>["body"];
export type CategorySearchParams = z.infer<
  typeof categorySearchSchema
>["query"];
export type BulkCategoryInput = z.infer<typeof bulkCategorySchema>["body"];
