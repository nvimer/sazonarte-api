import { Router } from "express";
import {
    createOrderSchema,
    orderIdSchema,
    orderSearchSchema,
    updateOrderStatusSchema,
} from "./order.validator";
import orderController from "./order.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { authJwt } from "../../../middlewares/auth.middleware";

/**
 * Order Routes
 *
 * Defines all HTTP routes for order operations.
 * This router handles:
 * - Order CRUD operations
 * - Order Status management
 * - Order filtering and search
 *
 * Authentication:
 * - All routes require JWT authentication
 * - User information available via req.user
 *
 * Validation:
 * - Request validation via Zod schemas
 * - Automatic error responses for invalid data
 */
const router = Router();

// Apply authentication to ALL order routes
// This ensures req.user is available in all controllers
router.use(authJwt);

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
 * Authentication: Required (waiter ID extracted automatically from JWT token)
 *
 * Request Body:
 * - tableId: Table number (optional, typically required for DINE_IN)
 * - customerId: Customer UUID (optional, for registered customers)
 * - type: Order type (DINE_IN | TAKE_OUT | DELIVERY | WHATSAPP, required)
 * - items: Array of order items (required, minimum 1 item)
 * - notes: Order notes (optional, max 500 characters)
 * - whatsappOrderId: WhatsApp order ID (optional, for WHATSAPP orders)
 *
 * Note: waiterId is automatically extracted from the authenticated user's JWT token
 *
 * Validation: createOrderSchema
 *
 * Automatic Operations:
 * - Waiter ID captured from JWT token (req.user.id)
 * - Price capture from current menu items (locked at order time)
 * - Total amount calculation
 * - Stock validation for TRACKED items
 * - Stock deduction for TRACKED items
 * - Audit trail creation
 *
 * Use Cases:
 * - POS order creation
 * - Mobile app orders
 * - WhatsApp bot orders
 * - Table service orders
 * - Take-out orders
 * - Delivery orders
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
