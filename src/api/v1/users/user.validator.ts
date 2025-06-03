import { z } from "zod";
import { idParamsSchema } from "../../../utils/params.schema";

export const userIdSchema = z.object({
  params: idParamsSchema,
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").max(50),
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

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().min(3, "Name must be at least3 characters long").max(50),
      email: z.string().email("Invalid email address"),
      phone: z.string().regex(/^\d{10}$/, "Phone number must be a 10 digits"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
      roleIds: z.array(
        z.number().int().positive("Role ID must be a positive integer"),
      ),
    })
    .partial(),
});

export type UserIdParams = z.infer<typeof userIdSchema>["params"];
export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
