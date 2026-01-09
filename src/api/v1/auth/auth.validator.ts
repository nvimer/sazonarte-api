import { z } from "zod";

/**
 * User registration validation schema
 *
 * Validates the request body for user registration operations.
 * This schema ensures all required fields are present and meet
 * the specified validation criteria for creating new user accounts.
 *
 * Validation Rules:
 * - firstName: Must be 2-50 characters long
 * - lastName: Must be 2-50 characters long
 * - email: Must be a valid email format
 * - phone: Must be exactly 10 digits (optional)
 * - password: Must be at least 8 characters long
 * - roleIds: Array of positive integers (optional)
 */
export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(3, "First name must be at least 3 characters long")
      .max(50, "First name cannot be exceed 50 characters"),
    lastName: z
      .string()
      .min(3, "Last name must be at least 3 characters long")
      .max(50, "Last name cannot be exceed 50 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be a 10 digits")
      .optional(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    roleIds: z.array(
      z
        .number()
        .int()
        .positive("Role ID must be a positive integer")
        .optional(),
    ),
  }),
});

/**
 * User login validation schema
 *
 * Validation Rules:
 * - email: Must be a valid email format
 * - password: Must be at least 8 characters long
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 3 characters long"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
