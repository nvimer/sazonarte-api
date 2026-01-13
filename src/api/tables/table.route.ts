import { Router } from "express";
import tableController from "./table.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  createTableSchema,
  updateTableSchema,
  tableIdSchema,
  updateTableStatusSchema,
} from "./table.validator";
import { paginationQuerySchema } from "../../utils/pagination.schema";

const router = Router();

/**
 * GET /tables
 * Retrieves a paginated list of all tables in the system.
 * This endpoint supports pagination parameters for efficient
 * data retrieval and display.
 */
router.get("/", validate(paginationQuerySchema), tableController.getTables);

/**
 * GET /tables/:id
 * Retrieves detailed information about a specific table by its ID.
 * This endpoint provides complete table information including
 * status, capacity, and other relevant details.
 */
router.get("/:id", validate(tableIdSchema), tableController.getTableById);

/**
 * POST /tables
 * Creates a new table in the system with the provided information.
 * This endpoint handles table creation with validation and
 * ensures proper data structure.
 */
router.post("/", validate(createTableSchema), tableController.postTable);

/**
 * PATCH /tables/:id
 * Updates an existing table with new information.
 * This endpoint allows modification of table properties
 * while maintaining data integrity and validation.
 */
router.patch("/:id", validate(updateTableSchema), tableController.updateTable);

/**
 * DELETE /tables/:id
 * Removes a table from the system permanently.
 * This endpoint handles table deletion with proper
 * cleanup and validation.
 */
router.delete("/:id", validate(tableIdSchema), tableController.deleteTable);

/**
 * PATCH /tables/:id/status
 * Updates the status of a specific table (available/occupied).
 * This endpoint is commonly used for real-time table status
 * management in restaurant operations.
 */
router.patch(
  "/:id/status",
  validate(updateTableStatusSchema),
  tableController.updateTableStatus,
);

export default router;
