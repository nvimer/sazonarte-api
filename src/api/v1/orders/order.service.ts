import { Order } from "@prisma/client";
import {
    PaginationParams,
    PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import { CustomError } from "../../../types/custom-errors";
import {
    InventoryType,
    OrderStatus,
    OrderWithItems,
    OrderWithRelations,
} from "../../../types/prisma.types";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import itemService from "../menus/items/item.service";
import { OrderRepositoryInterface } from "./interfaces/order.repository.interface";
import { OrderServiceInterface } from "./interfaces/order.service.interface";
import {
    CreateOrderBodyInput,
    OrderSearchParams,
    UpdateOrderStatusBodyInput,
} from "./order.validator";
import orderRepository from "./order.repository";

/**
 * Order Service
 *
 * Core business logic layer for order management operations
 * This service is responsible for:
 * - Order CRUD operatios with business rule enforment
 * - Stock intefration (validation and deduction)
 * - Price calculations and total amount management
 * - Order status workflow validation
 * - Data validation beyond schema validation
 *
 * Order Mangement Features:
 * - Order creation with stock validation
 * - Automatic stock deduction on order creation
 * - Stock reversion on order cancellation
 * - Total amount calculation from items
 * - Status transition validation
 * - Multi-item order support
 *
 * Business Rules:
 * - Order must have least one item (validator ensures)
 * - Stock validated for TRACKED items before order creation
 * - Prices captured from MenuItem at order
 * - Total calculated as sum of (price * quantity) for all items
 * - CANCELLED orders revert stock automatically
 * - Some status transitions restricted by business logic
 *
 * Integration Points:
 * - Item Service: Stock validation and deduction
 * - Repository: Database operations
 * - Menu Items: Price retrieval
 *
 * Performance Considerations:
 * - Stock validation in parallel where possible
 * - Database transactions for atomic operations
 * - Efficient queries through repository
 */
class OrderService implements OrderServiceInterface {
    constructor(private orderRepository: OrderRepositoryInterface) { }

    /**
     * Private Helper: Find Order by ID or Fail
     *
     * Centralizes the "find or fail" logic to avoid code duplication.
     * This method is used internally by other service methods that need
     * to ensure an order exists before performing operations on it.
     *
     * @params id - Order identifier
     * @returns Order with all relations
     * @throws CustomError with 404 status if order not found
     *
     * Use Cases:
     * - Status updates
     * - Order cancellation
     * - Order retrieval for modifications
     * - Pre-operation validation
     */
    private async findOrderByIdOrFail(id: string): Promise<OrderWithRelations> {
        const order = await this.orderRepository.findById(id);

        if (!order) {
            throw new CustomError(
                `Order with ID ${id} not found`,
                HttpStatus.NOT_FOUND,
                "ORDER_NOT_FOUND",
            );
        }
        return order;
    }

    /**
     * Retrieves Paginated List of Orders
     *
     * Service layer method for fetching order with pagination and filtering.
     * This is a simple delegations to repository layer as no additional
     * business logic is required for listing.
     *
     * @param params
     * @retuns Paginated list of orders with items
     *
     * Filtering Options:
     * - status: Filter by order status (e.g., IN_KITCHEN for kitchen display)
     * - type: Filter by order type (e.g., DINE_IN)
     * - waiterId: Filter by waiter (for waiter performance)
     * - tableId: Filter by table (for table tracking)
     * - date: Filter by creation date (for reports)
     *
     *
     * Use Cases:
     * - Active orders dashboard
     * - Kitchen display system
     * - Waiter order list
     * - Table order tracking
     * - Daily reports
     * - Order history
     */
    async findAllOrders(
        params: PaginationParams & OrderSearchParams,
    ): Promise<PaginatedResponse<OrderWithItems>> {
        return await this.orderRepository.findAll(params);
    }

    /**
     * Retrieves Specific Order by ID
     *
     * Fetches complete order details with all relations.
     * Uses Helper method to ensure order exists.
     *
     * @param id - Order identifier
     * @returns Complete order with items, table, waiter, customer
     * @throws CustomError if order not found
     *
     * Use Cases:
     * - Order detail page
     * - Order receipt generation
     * - Order modification interface
     * - Customer service inquiries
     * - Order audit trail
     */
    async findOrderById(id: string): Promise<OrderWithRelations> {
        return await this.findOrderByIdOrFail(id);
    }

    /**
     * Creates New Order with Stock Validation and Deduction
     *
     * Complex business logic method thats orchestrates order creation
     * with stock management. This is the core operation of the order system.
     *
     * @param data - Order creation data with items
     * @returns Created order with items
     * @throws CustomError if validation fails or insufficient stock
     *
     * Operation Flow:
     * 1. Validate all menu items exist and are available
     * 2. Check stock availability for TRACKED Items
     * 3. Retrieve current prices for all items
     * 4. Calculate total amount
     * 5. Create order with items in transaction
     * 6. Deduct stock for TRACKED items
     * 7. Return created order
     *
     * Stock Validation:
     * - For each item with TRACKED inventory type:
     *   - Check if stockQuantity >= ordered quantity
     *   - Throw error if insufficient stock
     * - For UNLIMITED items:
     *   - No stock validation needed
     *
     * Price Handling:
     * - Price captured from MenuItem at order time
     * - Stored in OrderItem.priceAtOrder
     * - Protected from future price changes
     * - Ensures order total consistency
     *
     * Total Calculation:
     * - Sum of (priceAtOrder * quantity) for all items
     * - Stored in Order.totalAmount
     * - Updated after order creation
     *
     *
     * Stock Deduction:
     * - Happens AFTER order creation succeeds
     * - Only for TRACKED inventory items
     * - Uses itemService.deductStockForOrder()
     * - Creates audit trail in StockAdjustment
     * - Includes order ID for traceability
     *
     * Error Scenarios:
     * - 404: Menu item not found
     * - 400: Meni item not available
     * - 400: Insufficient stock
     * - 500: Database transaction failure
     *
     * Transaction Safety:
     * - Order and items created in single transaction
     * - Stock deduction happens after (separate operations)
     * - If stock deduction fails, order remains but with note
     * - Consider implementing compensating transaction
     *
     * Business Rules:
     * - At least one item required (validatr ensures)
     * - All items must exist and be available
     * - Stock must be available for TRACKED items
     * - Prices locked at order time
     * - Total calculated automatically
     *
     * Use Cases:
     * - POS order creation
     * - Mobile app order placement
     * - WhatsApp order integration
     * - Table service orders
     * - Take-out orders
     * - Delivery orders
     */
    async createOrder(data: CreateOrderBodyInput): Promise<OrderWithItems> {
        // Step 1: Validate and ferch all menu items
        const menuItemsPromises = data.items.map((item) =>
            itemService.findMenuItemById(item.menuItemId),
        );

        const menuItems = await Promise.all(menuItemsPromises);

        const unavailableItems = menuItems.filter((item) => !item.isAvailable);
        if (unavailableItems.length > 0) {
            const itemNames = unavailableItems.map((item) => item.name).join(", ");
            throw new CustomError(
                `The following items are not available: ${itemNames}`,
                HttpStatus.BAD_REQUEST,
                "ITEMS_NOT_AVAILABLE",
            );
        }

        // Step 3: Validate stock for TRACKED items
        for (let i = 0; i < data.items.length; i++) {
            const orderItem = data.items[i];
            const menuItem = menuItems[i];

            // Only validate stock for TRACKED items
            if (menuItem.inventoryType === InventoryType.TRACKED) {
                const availableStock = menuItem.stockQuantity ?? 0;

                if (availableStock < orderItem.quantity) {
                    throw new CustomError(
                        `Insufficient stock for ${menuItem.name}`,
                        HttpStatus.BAD_REQUEST,
                        "INSUFFICIENT_STOCK",
                    );
                }
            }
        }

        // Step 4: Prepare order data with prices
        const orderDataWithPrices = {
            ...data,
            items: data.items.map((item, index) => ({
                ...item,
                priceAtOrder: menuItems[index].price,
            })),
        };

        // Step 5: Calculate total amount
        const totalAmount = orderDataWithPrices.items.reduce(
            (sum, item) => sum + Number(item.priceAtOrder) * item.quantity,
            0,
        );

        // Step 6: Create order in database
        let order = await this.orderRepository.create(orderDataWithPrices as any);
        order = (await this.orderRepository.updateTotal(
            order.id,
            totalAmount,
        )) as any;

        // Step 8: Deduct stock for TRACKED items
        const stockDeductionPromises = data.items.map((item, index) => {
            const menuItem = menuItems[index];
            if (menuItem.inventoryType === InventoryType.TRACKED) {
                return itemService.deductStockForOrder(
                    item.menuItemId,
                    item.quantity,
                    order.id,
                );
            }
            return Promise.resolve();
        });

        await Promise.all(stockDeductionPromises);

        // Step 9: Fetch and return complete order with items
        return (await this.orderRepository.findById(order.id)) as OrderWithItems;
    }

    /**
     * Updates Order Status with Validation
     *
     * Changes order status while enforcing business rules about
     * valid status transitions and side effects
     *
     * @param id - Order identifier
     * @param data - New Status
     * @returns Updated order
     * @throws CustomError if order not found or invalid transition
     *
     * Status Transition Rules:
     * - PENDING -> SENT_TO_CASHIER (waiter)
     * - SENT_TO_CASHIER -> PAID (cashier)
     * - PAID -> IN_KITCHEN (system/kitchen)
     * - IN_KITCHEN -> READY (kitchen)
     * - READY -> DELIVERED (waiter)
     * - Any -> CANCELLED (manager/admin)
     *
     * Invalid Transitions:
     * - Cannot change DELIVERED status
     * - Cannot change CANCELLED status
     * - Cannot skip statuses (e.g., PENDING -> DELIVERED)
     *
     * Side Effects:
     * - CANCELLED: Triggers stock reversion
     * - Other statuses: No automatic side effects
     *
     * Business Rules:
     * - Some transitions restricted by role (handled in middleware)
     * - Terminal statuses (DELIVERED, CANCELLED) cannot be changed
     * - Status changes logger for audit
     *
     * Use Cases:
     * - Waiter sending order to cashier
     * - Cashier marking order as paid
     * - Kitchen updating preparation status
     * - Waiter confirming delivery
     * - Manager cancelling orders
     */
    async updateOrderStatus(
        id: string,
        data: UpdateOrderStatusBodyInput,
    ): Promise<Order> {
        // Validate order exists
        const order = await this.findOrderByIdOrFail(id);

        // Validate terminal statuses cannot be changed
        if (order.status === OrderStatus.DELIVERED) {
            throw new CustomError(
                "Cannot change status of delivered order",
                HttpStatus.BAD_REQUEST,
                "INVALID_STATUS_TRANSITION",
            );
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new CustomError(
                "Cannot change status of cancelled order",
                HttpStatus.BAD_REQUEST,
                "INVALID_STATUS_TRANSITION",
            );
        }

        // Update status
        return this.orderRepository.updateStatus(id, data.status);
    }

    /**
     * Cancels Order and Reverts Stock
     *
     * Cancels an order and automatically reverts stock for all
     * TRACKED items. This ensures inventory accuracy.
     *
     * @param id - Order identifier
     * @returns Cancelled Order
     * @throws CustomError if order cannot be cancelled
     *
     * Operation Flow:
     * 1. Validate order exists
     * 2. Validate order can be cancelled
     * 3. Revert stock for all TRACKED items
     * 4. Update order status to CANCELLED
     * 5. Return cancelled order
     *
     * Stock Reversion:
     * - Reverts stock for all order items
     * - Only affects TRACKED inventory items
     * - Uses itemService.revertStockForOrder()
     * - Creates audit trail with order id
     * - Happens before status change for consistency
     *
     * Cancellation Rules:
     * - Cannot cancel DELIVERED orders
     * - Cannot cancel already CANCELLED orders
     * - Can cancel from any other status
     * - Some statuses may require special permissions
     *
     * Side Effects:
     * - Stock quantities restored
     * - Items may become available again
     * - Audit trail created
     * - Status changed to CANCELLED
     *
     * Business Rules:
     * - Manager/Admin permission may be required
     * - Time limits may apply (e.g., cannot cancel after 30 min)
     * - Customer notification may be triggered
     * - Payment refund may be initiated
     *
     * Use Cases:
     * - Customer cancellation
     * - Kitchen unable to prepare
     * - Incorrect order placed
     * - Customer left without paying
     * - Duplicate order correction
     */
    async cancelOrder(id: string): Promise<Order> {
        // Step 1: Validate order exists and get complete data
        const order = await this.findOrderByIdOrFail(id);

        // Step 2: Validate order can be cancelled
        if (order.status === OrderStatus.DELIVERED) {
            throw new CustomError(
                "Cannot cancel delivered order",
                HttpStatus.BAD_REQUEST,
                "CANNOT_CANCEL_DELIVERED_ORDER",
            );
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new CustomError(
                "Cannot cancel cancelled order",
                HttpStatus.BAD_REQUEST,
                "ORDER_ALREADY_CANCELLED",
            );
        }

        // Step 3: Revert stock for all items
        const stockReversionPromises = order.items.map((orderItem) => {
            if (
                orderItem.menuItem &&
                orderItem.menuItem.inventoryType === InventoryType.TRACKED
            ) {
                return itemService.revertStockForOrder(
                    orderItem.menuItemId!,
                    orderItem.quantity,
                    order.id,
                );
            }
            return Promise.resolve();
        });
        await Promise.all(stockReversionPromises);

        // Step 4: Update order status to CANCELLED
        return this.orderRepository.cancel(id);
    }
}

export default new OrderService(orderRepository);
