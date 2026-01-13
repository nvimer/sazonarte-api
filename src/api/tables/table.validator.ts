import { TableStatus } from "@prisma/client";
import { z } from "zod";

/**
 * Table status enumeration validation
 */
const tableStatus = z.enum(
  Object.values(TableStatus) as [TableStatus, ...TableStatus[]],
);

/**
 * Table creation validation schema
 *
 * Validates the request body for table creation operations.
 * This schema ensures all required fields are present and meet
 * the specified validation criteria for creating new tables.
 */
export const createTableSchema = z.object({
  body: z.object({
    number: z.string(),
    status: tableStatus.optional(),
    location: z.string().optional(),
  }),
});

/**
 * Table update validation schema
 *
 * Validates the request body for table update operations.
 * This schema allows partial updates while ensuring data
 * integrity and proper validation.
 */
export const updateTableSchema = z.object({
  body: z.object({
    number: z.string().optional(),
    status: tableStatus.optional(),
    location: z.string().optional(),
  }),
});

/**
 * Table ID parameter validation schema
 *
 * Validates the URL parameters for table-specific operations.
 * This schema ensures the table ID is properly formatted and
 * converted to the correct data type.
 *
 * Validation Rules:
 * - id: Must be a string that can be converted to a positive integer
 */
export const tableIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});

/**
 * Table status update validation schema
 *
 * Validates both URL parameters and request body for table
 * status update operations. This schema ensures proper
 * table identification and status validation.
 *
 * Validation Rules:
 * - id: Must be a string that can be converted to a positive integer
 * - status: Must be a valid table status (required)
 */
export const updateTableStatusSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    status: tableStatus,
  }),
});

export type CreateTableInput = z.infer<typeof createTableSchema>["body"];
export type UpdateTableInput = z.infer<typeof updateTableSchema>["body"];
