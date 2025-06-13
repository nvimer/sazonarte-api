import { Router } from "express";
import tableController from "./table.controller";
import { validate } from "../../../middlewares/validation.middleware";
import {
  createTableSchema,
  updateTableSchema,
  tableIdSchema,
  updateTableStatusSchema,
} from "./table.validator";
import { authJwt } from "../../../middlewares/auth.middleware";
import { paginationQuerySchema } from "../../../utils/pagination.schema";

const router = Router();

// All routes require authentication
//router.use(authJwt);

// Get all tables with pagination
router.get("/", validate(paginationQuerySchema), tableController.getTables);

// Get table by ID
router.get("/:id", validate(tableIdSchema), tableController.getTableById);

// Create new table (admin only)
router.post("/", validate(createTableSchema), tableController.postTable);

// Update table (admin only)
router.patch("/:id", validate(updateTableSchema), tableController.updateTable);

// Delete table (admin only)
router.delete("/:id", validate(tableIdSchema), tableController.deleteTable);

// Update table status (waiter and admin)
router.patch(
  "/:id/status",
  validate(updateTableStatusSchema),
  tableController.updateTableStatus
);

export default router;
