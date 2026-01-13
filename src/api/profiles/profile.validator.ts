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
 */
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long")
      .max(50, "First name cannot exceed 50 characters")
      .optional(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters long")
      .max(50, "Last name cannot exceed 50 characters")
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

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
