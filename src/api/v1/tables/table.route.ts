import { Router } from "express";
import tableController from "./table.controller";
import { validate } from "../../../middlewares/validation.middleware";
import {
  createTableSchema,
  updateTableSchema,
  tableIdSchema,
  updateTableStatusSchema,
} from "./table.validator";
import { paginationQuerySchema } from "../../../utils/pagination.schema";

/**
 * Express Router for Table management endpoints.
 *
 * This router defines all table management operations:
 * - GET / - Retrieve all tables with pagination
 * - GET /:id - Get specific table by ID
 * - POST / - Create a new table
 * - PATCH /:id - Update table information
 * - DELETE /:id - Delete a table
 * - PATCH /:id/status - Update table status
 *
 */
const router = Router();

/**
 * GET /tables
 *
 * Retrieves a paginated list of all tables in the system.
 * This endpoint supports pagination parameters for efficient
 * data retrieval and display.
 *
 * Validation:
 * - paginationQuerySchema: Validates pagination query parameters
 *
 * Response:
 * - 200: Tables retrieved successfully with pagination metadata
 * - 400: Invalid pagination parameters
 * - 500: Server error during retrieval
 *
 * Access Level: All authenticated users
 */
router.get("/", validate(paginationQuerySchema), tableController.getTables);

/**
 * GET /tables/:id
 *
 * Retrieves detailed information about a specific table by its ID.
 * This endpoint provides complete table information including
 * status, capacity, and other relevant details.
 *
 * Validation:
 * - tableIdSchema: Validates table ID parameter
 *
 */
router.get("/:id", validate(tableIdSchema), tableController.getTableById);

/**
 * POST /tables
 *
 * Creates a new table in the system with the provided information.
 * This endpoint handles table creation with validation and
 * ensures proper data structure.
 *
 * Validation:
 * - createTableSchema: Validates table creation data
 */
router.post("/", validate(createTableSchema), tableController.postTable);

/**
 * PATCH /tables/:id
 *
 * Updates an existing table with new information.
 * This endpoint allows modification of table properties
 * while maintaining data integrity and validation.
 *
 * Validation:
 * - tableIdSchema: Validates table ID parameter
 * - updateTableSchema: Validates table update data
 */
router.patch("/:id", validate(updateTableSchema), tableController.updateTable);

/**
 * DELETE /tables/:id
 *
 * Removes a table from the system permanently.
 * This endpoint handles table deletion with proper
 * cleanup and validation.
 *
 * Validation:
 * - tableIdSchema: Validates table ID parameter
 */
router.delete("/:id", validate(tableIdSchema), tableController.deleteTable);

/**
 * PATCH /tables/:id/status
 *
 * Updates the status of a specific table (available/occupied).
 * This endpoint is commonly used for real-time table status
 * management in restaurant operations.
 *
 * Validation:
 * - updateTableStatusSchema: Validates table ID and status
 */
router.patch(
  "/:id/status",
  validate(updateTableStatusSchema),
  tableController.updateTableStatus,
);

export default router;
