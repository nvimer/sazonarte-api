import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").max(255),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be a 10 digits")
    .optional(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  roleId: z.number().int().positive("Role ID must be a positive integer"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
