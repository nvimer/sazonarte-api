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
 */
export class OrderService implements OrderServiceInterface {
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
   */
  async findOrderById(id: string): Promise<OrderWithRelations> {
    return await this.findOrderByIdOrFail(id);
  }

  /**
   * Creates New Order with Stock Validation and Deduction
   * Complex business logic method thats orchestrates order creation
   * with stock management. This is the core operation of the order system.
   *
   * @param data - Order creation data with items
   * @returns Created order with items
   * @throws CustomError if validation fails or insufficient stock
   */
  async createOrder(
    id: string,
    data: CreateOrderBodyInput,
  ): Promise<OrderWithItems> {
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
    let order = await this.orderRepository.create(id, orderDataWithPrices);
    await this.orderRepository.updateTotal(order.id, totalAmount);

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
