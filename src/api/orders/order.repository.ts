import { Order, Prisma } from "@prisma/client";
import { OrderRepositoryInterface } from "./interfaces/order.repository.interface";
import { CreateOrderBodyInput, OrderSearchParams } from "./order.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../interfaces/pagination.interfaces";
import {
  OrderStatus,
  OrderWithItems,
  OrderWithRelations,
} from "../../types/prisma.types";
import prisma from "../../database/prisma";
import { createPaginatedResponse } from "../../utils/pagination.helper";

export class OrderRepository implements OrderRepositoryInterface {
  /**
   * Retrieves Paginated List of Orders with Filtering
   *
   * Fetches orders with their items and optional filters for status,
   * type, waiter, table, and date. Implements efficient pagination.
   *
   * @param params - Pagination and filter parameters
   * @returns Paginated response with orders and metadata
   */
  async findAll(
    params: PaginationParams & OrderSearchParams,
  ): Promise<PaginatedResponse<OrderWithItems>> {
    const { page, limit, status, type, waiterId, tableId, date } = params;
    const skip = (page - 1) * limit;

    // Build dynamic where conditions
    const where: Prisma.OrderWhereInput = {};

    if (status) where.status = status;
    if (type) where.type = type;
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
            firstName: true,
            lastName: true,
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
   */
  async create(
    waiterId: string,
    data: CreateOrderBodyInput,
  ): Promise<OrderWithItems> {
    // Extract items from order data
    const { items, ...orderData } = data;

    //  Create order with items in transaction
    const order = await prisma.order.create({
      data: {
        ...orderData,
        waiterId,
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
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status },
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
   */
  async updateTotal(id: string, totalAmount: number): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { totalAmount },
    });
  }
}

export default new OrderRepository();
