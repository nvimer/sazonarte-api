import { z } from "zod";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../interfaces/pagination.interfaces";

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_PAGE))
    .refine((val) => val > 0, {
      message: "Page must be greater than 0",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_LIMIT))
    .refine((val) => val > 0 && val <= MAX_LIMIT, {
      message: `Limit must be between 1 and ${MAX_LIMIT}`,
    }),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
