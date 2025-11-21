import { Order, Prisma } from "@prisma/client";
import { OrderRepositoryInterface } from "./interfaces/order.repository.interface";
import { CreateOrderBodyInput, OrderSearchParams } from "./order.validator";
import {
    PaginatedResponse,
    PaginationParams,
} from "../../../interfaces/pagination.interfaces";
import {
    OrderStatus,
    OrderWithItems,
    OrderWithRelations,
} from "../../../types/prisma.types";
import prisma from "../../../database/prisma";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

/**
 * Order Repository
 *
 * Data access layer for order-related database operations.
 * This repository handles all interactions with the Order and Orderitm tables.
 *
 * Key Features:
 * - Transaction support for atomic operations
 * - Optimized queries with selective relation loading
 * - Proper error handling for database constraints
 * - Pagination support for large datasets
 *
 * Database Operations:
 * - Order creation with items (transactional)
 * - Order retrieval with various filters
 * - Status updates
 * - Total amount calculations
 * - Order cancellations
 *
 * Performance Considerations:
 * - Uses Prisma's include for efficient joins
 * - Implements pagination to limit result sets
 * - Selective field loading to reduce payload
 * - Indexed queries on common filters
 */
class OrderRepository implements OrderRepositoryInterface {
    /**
     * Retrieves Paginated List of Orders with Filtering
     *
     * Fetches orders with their items and optional filters for status,
     * type, waiter, table, and date. Implements efficient pagination.
     *
     * @param params - Pagination and filter parameters
     * @returns Paginated response with orders and metadata
     *
     * Query Features:
     * - Includes order items with menu item details
     * - Filters by status (e.g., IN_KITCHEN for kitchen display)
     * - Filters by type (e.g., DINE_IN for dine-in orders)
     * - Filters by waiter (for waiter performance trakcing)
     * - Filters by table (for table service)
     * - Filters by date (for daily reports)
     * - Orders by creation data DESC (newest first)
     *
     * Performance:
     * - Parallel execution of query and count
     * - Pagination to limit result size
     * - Indexed fields for fast filtering
     *
     * Use Cases:
     * - Active order dashboard
     * - Kitchen display system (status=IN_KITCHEN)
     * - Waiter order list
     * - Table order tracking
     * - Daily order reports
     */
    async findAll(
        params: PaginationParams & OrderSearchParams,
    ): Promise<PaginatedResponse<OrderWithItems>> {
        const { page, limit, status, type, waiterId, tableId, date } = params;
        const skip = (page - 1) * limit;

        // Build dynamic where conditions
        const where: Prisma.OrderWhereInput = {};

        if (status) where.status = status as any;
        if (type) where.type = type as any;
        if (waiterId) where.waiterId = waiterId;
        if (tableId) where.tableId = tableId;
        if (date) {
            // Filter by date (start of day to end of day)
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            where.createdAt = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        // Execute query and count and parallel for perfomance
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);
        return createPaginatedResponse(orders, total, { page, limit });
    }

    /**
     * Retrieves Specific Order by ID with All Relations
     *
     * Fetches complete order details including items, table, waiter,
     * customer, and payment informtion. Used for detailed order views.
     *
     * @param id - Order identifier (UUID)
     * @returns Complete order with all relations, or null if not found
     *
     * Included Relations:
     * - items: Order items with menu item details
     * - table: Table information (if applicable)
     * - waiter: Waiter who took the order
     * - customer: Customer information (if available)
     * - payments: Payment records
     *
     * Use Cases:
     * - Order detail page
     * - Order receipt generation
     * - Order modification interface
     * - Order audit trail
     * - Customer service inquiries
     *
     * Performance:
     * - Single query with all joins
     * - Optimized with Prima's include
     * - Returns null if not found (no exception)
     */
    async findById(id: string): Promise<OrderWithRelations | null> {
        return prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
                table: true,
                waiter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                customer: true,
                payments: true,
            },
        });
    }

    /**
     * Creates New Order with Items in Atomic Transaction
     *
     * Crates and order and its items in a single database transaction
     * to ensure data cosistency. If any part fails, entire operation
     * is rolled back.
     *
     * @param data - Order creation data with items
     * @returns Created order with items
     *
     * Transaction Steps:
     * 1. Validate all menu items exists (done in service)
     * 2. Create order record
     * 3. Create all order item records
     * 4. Return order with items
     *
     * Data Processing:
     * - Items are extracted from order data
     * - Each items gets priceAtOrder from current MenuItem price
     * - Total amount is calculated in service layer
     * - Status defaults to PENDING
     *
     * Business Rules:
     * - Order and items created atomically
     * - Price captured at order time (priceAtOrder)
     * - Stock deduction happens in sercie layer
     * - Default status is PENDING
     *
     * Error Handling:
     * - Foreign key violations (invalid IDs)
     * - Unique constraint violations
     * - Transacion rollback on any error
     *
     * Use Cases:
     * - POS order creation
     * - Mobile app order placement
     * - WhatsApp order integration
     * - Table service orders
     */
    async create(data: CreateOrderBodyInput): Promise<OrderWithItems> {
        // Extract items from order data
        const { items, ...orderData } = data;

        //  Create order with items in transaction
        const order = await prisma.order.create({
            data: {
                ...orderData,
                status: OrderStatus.PENDING,
                totalAmount: 0,
                items: {
                    create: items?.map((item) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        priceAtOrder: 0,
                        notes: item.notes,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });
        return order;
    }

    /**
     * Updates Order Status
     *
     * Changes the status of an order. Status transitions should be
     * validated in the service layer according to business rules.
     *
     * @param id - Order identifier
     * @param status - New order status
     * @returns Updated order
     *
     * Status Flow:
     * PENDING -> SENT_TO_CASHIER -> PAID -> IN_KITCHEN -> READY -> DELIVERED
     * CANCELLED (from any status)
     *
     * Side Effects (handled in service layer):
     * - CANCELLED: Revert stock
     * - PAID: Update payment records
     * - IN_KITCHEN: Notify kitchen system
     * - READY: Notify serving staff
     * - DELIVERED: Mark as complete
     *
     * Business Rules:
     * - Some transitions restricted by role
     * - CANCELLED and DELIVERED are terminal states
     * - Status changes logged for audit
     *
     * Use Cases:
     * - Order workflow progression
     * - Kitchen status updates
     * - Order cancellations
     * - Delivery confirmations
     */
    async updateStatus(id: string, status: string): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data: { status: status as any },
        });
    }

    /**
     * Cancels an Order
     *
     * Sets order status to cancelled. Stock reversion and other
     * cleanup operations are handled in the service layer.
     *
     * @param id - Order identifier
     * @returns Cancelled order
     *
     * Business Logic:
     * - Status set to CANCELLED
     * - Stock reverted (service layer)
     * - Payments may need reversal (service layer)
     * - Cancellation logged (service layer)
     *
     * Restrictions:
     * - Some statuses may not allow cancellation
     * - Requires appropriate permissions
     * - May have time restrictions
     *
     * Use Cases:
     * - Customer cancellation
     * - Kitchen unable to prepare
     * - Customer left before payment
     * - Incorrect order placed
     */
    async cancel(id: string): Promise<Order> {
        return this.updateStatus(id, OrderStatus.CANCELLED);
    }

    /**
     * Updates Order Total Amount
     *
     * Updates the total amount after calculation in service layer.
     * Amount includes all items, taxes, tips, and discounts.
     *
     * @param id - Order identifier
     * @param totalAmount - Calculated total amount
     * @returns Updated Order
     *
     * Calculation (done in service layer):
     * - Sum of (item.priceAtOrder * item.quantity)
     * - Plus taxes (if applicable)
     * - Plus tips (if applicable)
     * - Minus discounts (if applicable)
     *
     * Use Cases:
     * - After order creation
     * - After order modification
     * - After discount application
     * - Before payment processing
     */
    async updateTotal(id: string, totalAmount: number): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data: { totalAmount },
        });
    }
}

export default new OrderRepository();
