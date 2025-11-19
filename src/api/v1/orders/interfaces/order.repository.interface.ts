import { Order } from "@prisma/client";
import {
    PaginatedResponse,
    PaginationParams,
} from "../../../../interfaces/pagination.interfaces";
import {
    OrderWithItems,
    OrderWithRelations,
} from "../../../../types/prisma.types";
import { CreateOrderBodyInput, OrderSearchParams } from "../order.validator";

/**
 * Order Repository Interface
 *
 * Defines the contract for order data access operations.
 * All order repository implementations must follow this Interface
 * to ensure consistency and enable dependency injection.
 *
 * Responsabilities:
 * - Database CRUD operations for orders
 * - Query optimization with proper relations
 * - Transaction management
 * - Data integrity maintenance
 *
 * Implementation Notes:
 * - Use Prisma transactions for order+items creation
 * - Include proper error handling
 * - Optimize queries with selective field inclusion
 * - Handle cascading deletes properly
 */
export interface OrderRepositoryInterface {
    /**
     * Retrieves a paginated list of orders with optional filtering
     *
     * @param params - Pagination and filter parameters
     * @returns Paginated list of orders with items
     */
    findAll(
        params: PaginationParams & OrderSearchParams,
    ): Promise<PaginatedResponse<OrderWithItems>>;

    /**
     * Retrieves a specific order by ID with all relations
     *
     * @params id - Order identifier (UUID)
     * @returns Complete order with items, table, waiter, customer, or null.
     */
    findById(id: string): Promise<OrderWithRelations | null>;

    /**
     * Creates a new order with items in a transaction
     *
     * @param data - Order creation data including items
     * @returns Created order with items
     */
    create(data: CreateOrderBodyInput): Promise<OrderWithItems>;

    /**
     * Updates order status
     *
     * @param id - Order identifier
     * @param status - New order status
     * @returns Updated order
     */
    updateStatus(id: string, status: string): Promise<Order>;

    /**
     * Cancels an order (soft delete by changing status)
     *
     * @param id - Order identifier
     * @returns Cancelled order
     */
    cancel(id: string): Promise<Order>;

    /**
     * Updates order total amount
     *
     * @param id - Order identifier
     * @param totalAmount - New total amount
     * @returns Updated order
     */
    updateTotal(id: string, totalAmount: number): Promise<Order>;
}
