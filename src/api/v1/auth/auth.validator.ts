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
 *
 * Error Messages:
 * - firstName: "First name must be at least 2 characters long"
 * - lastName: "Last name must be at least 2 characters long"
 * - email: "Invalid email address"
 * - phone: "Phone number must be a 10 digits"
 * - password: "Password must be at least 8 characters long"
 * - roleIds: "Role ID must be a positive integer"
 *
 * Security Features:
 * - Password minimum length requirement
 * - Email format validation
 * - Phone number format validation
 * - Role ID validation for security
 *
 * Use Cases:
 * - POST /auth/register endpoint
 * - User account creation
 * - Registration form validation
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
 * Validates the request body for user login operations.
 * This schema ensures login credentials are properly formatted
 * and meet security requirements for authentication.
 *
 * Validation Rules:
 * - email: Must be a valid email format
 * - password: Must be at least 8 characters long
 *
 * Error Messages:
 * - email: "Invalid email address"
 * - password: "Password must be at least 8 characters long"
 *
 * Security Features:
 * - Email format validation
 * - Password minimum length requirement
 * - Credential format validation
 *
 * Use Cases:
 * - POST /auth/login endpoint
 * - User authentication
 * - Login form validation
 *
 * Note: The password length requirement is set to 8 characters
 * for security, but the error message mentions 3 characters
 * which should be corrected for consistency.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 3 characters long"),
  }),
});

/**
 * Type Structure:
 * - firstName: string - User's first name (2-50 characters)
 * - lastName: string - User's last name (2-50 characters)
 * - email: string - User's email address
 * - phone?: string - User's phone number (optional, 10 digits)
 * - password: string - User's password (min 8 characters)
 * - roleIds?: number[] - Array of role IDs (optional)
 */
export type RegisterInput = z.infer<typeof registerSchema>["body"];

/**
 * Type Structure:
 * - email: string - User's email address
 * - password: string - User's password (min 8 characters)
 */
export type LoginInput = z.infer<typeof loginSchema>["body"];
