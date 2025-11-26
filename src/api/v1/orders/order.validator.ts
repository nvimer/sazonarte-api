import { z } from "zod";
import { OrderStatus, OrderType } from "../../../types/prisma.types";
import { idParamsSchema } from "../../../utils/params.schema";

/**
 * Order Status Enum Validation
 *
 * Validates order status values to ensure only valid statuses
 * are accepted in API requests.
 *
 * Valid statuses:
 * - PENDING: Order created, waiting for processing
 * - SENT_TO_CASHIER: Order sent to cashier for payment
 * - PAID: Order has been paid
 * - IN_KITCHEN: Order being prepared in kitchen
 * - READY: Order ready for pickup/delivery
 * - DELIVERED: Order delivered to customer
 * - CANCELLED: Order cancelled
 *
 * Status Flow:
 * PENDING → SENT_TO_CASHIER → PAID → IN_KITCHEN → READY → DELIVERED
 * CANCELLED (from any status)
 */
const orderStatusEnum = z.enum(
    Object.values(OrderStatus) as [OrderStatus, ...OrderStatus[]],
);

/**
 * Order Type Enum Validation
 *
 * Validates order type to ensure proper classification.
 *
 * Types:
 * - DINE_IN: Customer eating in restaurant (requires table)
 * - TAKE_OUT: Customer picking up order
 * - DELIVERY: Order delivered to customer address
 * - WHATSAPP: Order placed via WhatsApp integration
 */
const orderTypeEnum = z.enum(
    Object.values(OrderType) as [OrderType, ...OrderType[]],
);

/**
 * Validation Schema for Order ID Parameters
 *
 * Validates the ID parameter in URL paths for order operations.
 * The ID is a UUID string.
 *
 * Use Cases:
 * - GET /orders/:id (retrieve specific order)
 * - PATCH /orders/:id/status (update order status)
 * - DELETE /orders/:id (cancel order)
 */
export const orderIdSchema = z.object({
    params: idParamsSchema,
});

/**
 * Validation Schema for Order Item Creation
 *
 * Validates individual items when creating an order.
 * Each item represents a menu item with quantity and optional notes.
 *
 * Fields:
 * - menuItemId: Menu item identifier (must exist in database)
 * - quantity: Number of items (must be positive)
 * - notes: Optional special instructions (e.g., "no onions", "without salad")
 *
 * Business Rules:
 * - Quantity must be at least 1
 * - MenuItem must exist and be available
 * - Stock validation happens in service layer
 * - Price is captured from MenuItem at order time
 */
const orderItemSchema = z.object({
    menuItemId: z.number().int().positive("Menu item ID must be positive"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
});

/**
 * Validation Schema for Order Creation
 *
 * Validates the complete request body for creating a new order.
 * This is the main schema user when a waiter/POS creates an order.
 *
 * Required Fields:
 * - waiterId: User ID of the waiter taking the order
 * - items: Array of order items (at least 1 required)
 * - type: Order type (DINE_IN, TAKE_OUT, DELIVERY, WHATSAPP)
 *
 * Optional Fields:
 * - tableId: Table number (required for DINE_IN, optional for others)
 * - customerId: Customer identifier (for registered customers)
 * - notes: General order notes/instructions
 * - whatsappOrderId: WhatsApp order identifier (for WHATSAPP type)
 *
 * Business Rules:
 * - At least one item is required.
 * - DINE_IN orders typically have a table
 * - Waiter must exist and have WAITER role
 * - Total amount is calculated automatically
 * - Stock is validated and deducted in service layer
 *
 * Validation Flow:
 * - Validate order structure
 * - Validate each order item
 * - Service layer validates stock availability
 * - Service layer validates prices
 * - Service layer calculates total
 *
 * Use Cases:
 * - POS system order creation
 * - Mobile app order placement
 * - WhatsApp bot integration
 * - Table service orders
 */
export const createOrderSchema = z.object({
    body: z.object({
        tableId: z.number().int().positive("Table ID must be positive").optional(),
        customerId: z.string().uuid("Customer ID must be a valid UUID").optional(),
        type: orderTypeEnum,
        items: z
            .array(orderItemSchema)
            .min(1, "Order must contain at least one item."),
        notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
        whatsappOrderId: z
            .string()
            .max(100, "WhatsApp Order ID cannot exceed 100 characters")
            .optional(),
    }),
});

/**
 * Validation Schema for Order Status Update
 *
 * Validates requests to updated order status.
 * Status updates must follow business logic and permissions
 *
 * Status Transitions:
 * - PENDING -> SENT_TO_CASHIER (waiter)
 * - SENT_TO_CASHIER -> PAID (cashier)
 * - PAID -> IN_KITCHEN (kitchen / system)
 * - IN_KITCHEN -> READY (kitchen)
 * - READY -> DELIVERED (waiter)
 * - Any status -> CANCELLED (manager/admin)
 *
 * Business Rules:
 * - Some transitions are resticted by role
 * - CANCELLED orders cannot be updated
 * - DELIVERED orders cannot be changed
 * - Status changes may trigger actions:
 *  - CANCELLED: Revert stock
 *  - PAID: Update payment records
 *  - IN_KITCHEN: Notify kitchen
 *
 * Use Cases:
 * - Waiter sending order to cashier
 * - Cashier marking order as paid
 * - Kitchen updating preparation status
 * - Manager cancelling orders
 */
export const updateOrderStatusSchema = z.object({
    params: idParamsSchema,
    body: z.object({
        status: orderStatusEnum,
    }),
});

/**
 * Validation Schema for Order Search/Filter Parameters
 *
 * Validates query parameters for searching and filtering orders.
 * Supports multiple filter criteria for flexible order management.
 *
 * Query Parameters:
 * - status: Filter by order status (optional)
 * - type: Filter by order type (optional)
 * - waiterId: Filter by waiter (optional)
 * - tableId: Gilter by table (optional)
 * - date: Filter by creation data (optional)
 * - page: Page number for pagination (default: 1)
 * - limit: Records per page (default: 10, max: 100)
 *
 * Use Cases:
 * - Active orders dashboard
 * - Kitchen display system
 * - Waiter order history
 * - Table order tracking
 * - Date range reports
 */
export const orderSearchSchema = z.object({
    query: z.object({
        status: orderStatusEnum.optional(),
        type: orderTypeEnum.optional(),
        waiterId: z.string().uuid().optional(),
        tableId: z.coerce.number().int().positive().optional(),
        date: z.coerce.date().optional(),
    }),
});

/**
 * Typescript Type Definitions
 *
 * Derived from Zod Schemas to ensure type safety throughout
 * the application. These types are used in service and controller layers.
 */
export type OrderIdParams = z.infer<typeof orderIdSchema>["params"];
export type CreateOrderBodyInput = z.infer<typeof createOrderSchema>["body"];
export type UpdateOrderStatusBodyInput = z.infer<
    typeof updateOrderStatusSchema
>["body"];
export type OrderSearchParams = z.infer<typeof orderSearchSchema>["query"];
export type OrderItemInput = z.infer<typeof orderItemSchema>;
