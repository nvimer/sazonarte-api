import { Router } from "express";
import {
    createOrderSchema,
    orderIdSchema,
    orderSearchSchema,
    updateOrderStatusSchema,
} from "./order.validator";
import orderController from "./order.controller";
import { validate } from "../../../middlewares/validation.middleware";

/**
 * Order Routes
 *
 * Defines all HTTP routes for order operations.
 * This router handles:
 * - Order CRUD operations
 * - Order Status management
 * - Order filtering and search
 *
 * Validation:
 * - Request validation via Zod schemas
 * - Automatic error responses for invalid data
 */
const router = Router();

/**
 * GET /orders
 *
 * Retrieves paginated list of orders with optional filtering.
 *
 * Query Parameters:
 * - page: Page number (optional, default: 1)
 * - limit: Records per page (optional, default: 20, max: 100)
 * - status: Filter by order status (optional)
 * - type: Filter by orter type (optional)
 * - waiterId: Filter by waiter (optional)
 * - tableId: Filter by table number (optional)
 * - date: Filter by date (optional)
 *
 * Authentication: Required
 * Validation: orderSearchSchema
 *
 * Use Cases:
 * - Active orders dashboard
 * - Kitchen display (status=IN_KITCHEN)
 * - Waiter order list
 * - Table tracking
 * - Daily reports
 */
router.get("/", validate(orderSearchSchema), orderController.getOrders);

/**
 * GET /orders/:id
 *
 * Retrieves detailed information about a specific order
 *
 * URL Parameters:
 * - id: Order identifier (UUID, required)
 *
 * Authentication: Required
 * Validation: orderIdSchema
 *
 * Use Cases:
 * - Order detail page
 * - Order receipt
 * - Order modification
 * - Customer service
 */
router.get("/:id", validate(orderIdSchema), orderController.getOrder);

/**
 * POST /orders
 *
 * Creates a new order with items and stock management
 *
 * Request Body:
 * - waiterId: Waiter UUID (required)
 * - tableId: Table number (optional)
 * - customerId: Customer UUID (optional)
 * - type: Order type (DINE_IN | TAKE_OUT | DELIVERY | WHATSAPP, required)
 * - notes: Order notes optional
 * - whatsappOrderId: WhatsApp order ID (optional)
 *
 * Authentication: Required
 * Validation: createOrderSchema
 *
 * Automatic Operations:
 * - Price capture
 * - Total calculation
 * - Stock validation
 * - Stock deduction
 *
 * Use Cases:
 * - POS order creation
 * - Mobile orders
 * - WhatsApp orders
 * - Table service
 */
router.post("/", validate(createOrderSchema), orderController.createOrder);

/**
 * PATCH /orders/:id/status
 *
 * Updates order status through workflow.
 *
 * URL Parameters:
 * - id: Order identifier (UUID, required)
 *
 * Request Body:
 * - status: New order status (required)
 *
 * Authentication: Required
 * Validation: updateOrderStatusSchema
 *
 * Status Flow:
 * PENDING -> SENT_TO_CASHIER -> PAID -> IN_KITCHEN -> READY -> DELIVERED
 * CANCELLED (from any status, use DELETE instead)
 *
 * Use Cases:
 * - Workflow progression
 * - Kitchen updates
 * - Payment confirmation
 * - Delivery confirmation
 */
router.patch(
    "/:id/status",
    validate(updateOrderStatusSchema),
    orderController.updateOrderStatus,
);

/**
 * DELETE /orders/:id
 *
 * Cancels order and reverts stock
 *
 * URL Parameters:
 * - id: Order identifier (UUID, required)
 *
 * Authentication: Required
 * Validation: orderIdSchema
 *
 * Automatic Operations:
 * - Status set to CANCELLED
 * - Stock reverted
 * - Audit trail created
 *
 * Restrictions:
 * - Cannot cancel DELIVERED orders
 * - Cannot cancel already CANCELLED orders
 *
 * Use Cases:
 * - Customer cancellation
 * - Kitchen issues
 * - Incorrect orders
 * - Manager override
 */
router.delete("/:id", validate(orderIdSchema), orderController.cancelOrder);

export default router;
