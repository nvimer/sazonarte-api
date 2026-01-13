import {
  createOrderFixture,
  createOrderWithItemsFixture,
  createOrderWithRelationsFixture,
} from "../helpers/order.fixtures";
import { OrderStatus, OrderType } from "../../../../types/prisma.types";

// Create mock functions
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockCount = jest.fn();

// Mock Prisma
jest.mock("../../../../database/prisma", () => ({
  __esModule: true,
  default: {
    order: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      count: mockCount,
    },
  },
}));

// Mock pagination helper
jest.mock("../../../../utils/pagination.helper", () => ({
  createPaginatedResponse: jest.fn((data, total, params) => ({
    data,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit) || 1,
      hasNextPage: params.page < Math.ceil(total / params.limit),
      hasPreviousPage: params.page > 1,
    },
  })),
}));

import orderRepository from "../../order.repository";

describe("OrderRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated orders", async () => {
      // Arrange
      const mockOrders = [
        createOrderWithItemsFixture(),
        createOrderWithItemsFixture(),
      ];
      mockFindMany.mockResolvedValue(mockOrders);
      mockCount.mockResolvedValue(2);

      // Act
      const result = await orderRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it("should calculate skip correctly for pagination", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(50);

      // Act
      await orderRepository.findAll({ page: 3, limit: 15 });

      // Assert - page 3 with limit 15 = skip 30
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 30,
          take: 15,
        }),
      );
    });

    it("should filter by status", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await orderRepository.findAll({
        page: 1,
        limit: 10,
        status: OrderStatus.PENDING,
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OrderStatus.PENDING,
          }),
        }),
      );
    });

    it("should filter by type", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await orderRepository.findAll({
        page: 1,
        limit: 10,
        type: OrderType.DINE_IN,
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: OrderType.DINE_IN,
          }),
        }),
      );
    });

    it("should filter by waiterId", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await orderRepository.findAll({
        page: 1,
        limit: 10,
        waiterId: "waiter-123",
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            waiterId: "waiter-123",
          }),
        }),
      );
    });

    it("should filter by tableId", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await orderRepository.findAll({
        page: 1,
        limit: 10,
        tableId: 5,
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tableId: 5,
          }),
        }),
      );
    });

    it("should filter by date", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);
      const testDate = new Date("2024-01-15");

      // Act
      await orderRepository.findAll({
        page: 1,
        limit: 10,
        date: testDate,
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it("should combine multiple filters", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await orderRepository.findAll({
        page: 1,
        limit: 10,
        status: OrderStatus.IN_KITCHEN,
        type: OrderType.DINE_IN,
        waiterId: "waiter-123",
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: OrderStatus.IN_KITCHEN,
            type: OrderType.DINE_IN,
            waiterId: "waiter-123",
          },
        }),
      );
    });

    it("should order by createdAt descending", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await orderRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
    });

    it("should include items with menuItem", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await orderRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return order with all relations", async () => {
      // Arrange
      const mockOrder = createOrderWithRelationsFixture();
      mockFindUnique.mockResolvedValue(mockOrder);

      // Act
      const result = await orderRepository.findById("order-123");

      // Assert
      expect(result).toEqual(mockOrder);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: "order-123" },
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
    });

    it("should return null when order does not exist", async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act
      const result = await orderRepository.findById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create order with items", async () => {
      // Arrange
      const waiterId = "waiter-123";
      const createData = {
        tableId: 1,
        type: OrderType.DINE_IN,
        items: [
          { menuItemId: 1, quantity: 2, notes: "Sin cebolla" },
          { menuItemId: 2, quantity: 1 },
        ],
      };
      const mockCreatedOrder = createOrderWithItemsFixture();
      mockCreate.mockResolvedValue(mockCreatedOrder);

      // Act
      const result = await orderRepository.create(waiterId, createData);

      // Assert
      expect(result).toEqual(mockCreatedOrder);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tableId: 1,
          type: OrderType.DINE_IN,
          waiterId: "waiter-123",
          status: OrderStatus.PENDING,
          totalAmount: 0,
          items: {
            create: [
              {
                menuItemId: 1,
                quantity: 2,
                priceAtOrder: 0,
                notes: "Sin cebolla",
              },
              {
                menuItemId: 2,
                quantity: 1,
                priceAtOrder: 0,
                notes: undefined,
              },
            ],
          },
        }),
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    });

    it("should create order without tableId (TAKE_OUT)", async () => {
      // Arrange
      const waiterId = "waiter-123";
      const createData = {
        type: OrderType.TAKE_OUT,
        items: [{ menuItemId: 1, quantity: 1 }],
      };
      const mockCreatedOrder = createOrderWithItemsFixture({
        type: OrderType.TAKE_OUT,
        tableId: null,
      });
      mockCreate.mockResolvedValue(mockCreatedOrder);

      // Act
      const result = await orderRepository.create(waiterId, createData);

      // Assert
      expect(result).toEqual(mockCreatedOrder);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: OrderType.TAKE_OUT,
          waiterId: "waiter-123",
          status: OrderStatus.PENDING,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe("updateStatus", () => {
    it("should update order status to IN_KITCHEN", async () => {
      // Arrange
      const mockUpdatedOrder = createOrderFixture({
        status: OrderStatus.IN_KITCHEN,
      });
      mockUpdate.mockResolvedValue(mockUpdatedOrder);

      // Act
      const result = await orderRepository.updateStatus(
        "order-123",
        OrderStatus.IN_KITCHEN,
      );

      // Assert
      expect(result.status).toBe(OrderStatus.IN_KITCHEN);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: { status: OrderStatus.IN_KITCHEN },
      });
    });

    it("should update order status to DELIVERED", async () => {
      // Arrange
      const mockUpdatedOrder = createOrderFixture({
        status: OrderStatus.DELIVERED,
      });
      mockUpdate.mockResolvedValue(mockUpdatedOrder);

      // Act
      const result = await orderRepository.updateStatus(
        "order-123",
        OrderStatus.DELIVERED,
      );

      // Assert
      expect(result.status).toBe(OrderStatus.DELIVERED);
    });
  });

  describe("cancel", () => {
    it("should cancel order by setting status to CANCELLED", async () => {
      // Arrange
      const mockCancelledOrder = createOrderFixture({
        status: OrderStatus.CANCELLED,
      });
      mockUpdate.mockResolvedValue(mockCancelledOrder);

      // Act
      const result = await orderRepository.cancel("order-123");

      // Assert
      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: { status: OrderStatus.CANCELLED },
      });
    });
  });

  describe("updateTotal", () => {
    it("should update order total amount", async () => {
      // Arrange
      const mockUpdatedOrder = {
        ...createOrderFixture(),
        totalAmount: 45000,
      };
      mockUpdate.mockResolvedValue(mockUpdatedOrder);

      // Act
      const result = await orderRepository.updateTotal("order-123", 45000);

      // Assert
      expect(result.totalAmount).toBe(45000);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: { totalAmount: 45000 },
      });
    });

    it("should handle zero total amount", async () => {
      // Arrange
      const mockUpdatedOrder = {
        ...createOrderFixture(),
        totalAmount: 0,
      };
      mockUpdate.mockResolvedValue(mockUpdatedOrder);

      // Act
      const result = await orderRepository.updateTotal("order-123", 0);

      // Assert
      expect(result.totalAmount).toBe(0);
    });
  });
});
