import { z } from "zod";

/**
 * Profile ID validation schema
 *
 * Error Message: "Invalid profile ID format"
 */
export const profileIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid profile ID format"),
  }),
});

/**
 * Profile update validation schema
 *
 * Validates the request body for profile update operations.
 * All fields are optional to support partial updates, but when
 * provided, they must meet specific validation criteria.
 *
 * Validation Rules:
 * - name: If provided, must be a non-empty string
 * - email: If provided, must be a valid email format
 * - phone: If provided, must be a string (no specific format validation)
 *
 * Error Messages:
 * - name: "Name is required" (if provided but empty)
 * - email: "Invalid email format" (if provided but invalid)
 *
 * Note: This schema supports partial updates, allowing clients
 * to update only specific fields without affecting others.
 */
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(50)
      .optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be 10 digits")
      .optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .optional(),
    photoUrl: z.string().url("Invalid URL").optional(),
    birthDate: z.string().datetime("Invalid date format").optional(),
    identification: z.string().optional(),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(200)
      .optional(),
  }),
});

/**
 * Type Structure:
 * - name?: string - Optional user name
 * - email?: string - Optional email address
 * - phone?: string - Optional phone number
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
