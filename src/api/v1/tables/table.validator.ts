import { TableStatus } from "@prisma/client";
import { z } from "zod";

/**
 * Table status enumeration validation
 *
 * Creates a Zod enum from the Prisma TableStatus enum
 * to ensure only valid table status values are accepted.
 *
 * Valid Table Status Values:
 * - 'available': Table is free for reservations
 * - 'occupied': Table is currently in use
 * - 'reserved': Table is reserved for future use
 * - 'maintenance': Table is under maintenance
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
 *
 * Validation Rules:
 * - number: Must be a non-empty string (table identifier)
 * - status: Must be a valid table status (optional, defaults to 'available')
 * - location: Must be a string (optional, table location description)
 *
 * Error Messages:
 * - number: "Table number is required"
 * - status: "Invalid table status"
 * - location: "Location must be a string"
 *
 * Data Integrity:
 * - Table number uniqueness validation
 * - Status enum validation
 * - Optional field handling
 * - Type safety enforcement
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
 *
 * Validation Rules:
 * - number: Must be a string (optional, for table identifier updates)
 * - status: Must be a valid table status (optional, for status changes)
 * - location: Must be a string (optional, for location updates)
 *
 * Update Features:
 * - Partial updates supported
 * - Optional field validation
 * - Type safety enforcement
 * - Data integrity maintenance
 *
 * Error Messages:
 * - number: "Table number must be a string"
 * - status: "Invalid table status"
 * - location: "Location must be a string"
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
 *
 * Data Transformation:
 * - Converts string ID to integer using parseInt
 * - Ensures proper numeric format
 * - Handles base-10 conversion
 *
 * Error Messages:
 * - id: "Invalid table ID format"
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
 *
 * Data Transformation:
 * - Converts string ID to integer using parseInt
 * - Validates status against enum values
 * - Ensures proper data types
 *
 * Error Messages:
 * - id: "Invalid table ID format"
 * - status: "Invalid table status"
 *
 * Status Values:
 * - 'available': Table is free for reservations
 * - 'occupied': Table is currently in use
 * - 'reserved': Table is reserved for future use
 * - 'maintenance': Table is under maintenance
 *
 */
export const updateTableStatusSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    status: tableStatus,
  }),
});

/**
 * Type Structure:
 * - number: string - Table identifier/number
 * - status?: TableStatus - Table status (optional)
 * - location?: string - Table location description (optional)
 */
export type CreateTableInput = z.infer<typeof createTableSchema>["body"];

/**
 * Type Structure:
 * - number?: string - Updated table identifier/number (optional)
 * - status?: TableStatus - Updated table status (optional)
 * - location?: string - Updated table location description (optional)
 */
export type UpdateTableInput = z.infer<typeof updateTableSchema>["body"];
