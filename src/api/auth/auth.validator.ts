import { z } from "zod";

/**
 * User registration validation schema
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
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 3 characters long"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
