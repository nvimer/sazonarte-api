import { OrderService } from "../../order.service";
import { OrderRepository } from "../../order.repository";
import {
  cleanupTestData,
  setupTestMenuItem,
  setupTestOrder,
  setupTestOrderItem,
  setupTestUser,
} from "../../../../../tests/helpers/database-helpers";
import { OrderStatus, OrderType } from "../../../../../types/prisma.types";
import { testDatabaseClient } from "../../../../../tests/setup";

describe("OrderService - Integration Tests", () => {
  let orderService: OrderService;
  let orderRepository: OrderRepository;
  let testUser: any;
  let testMenuItem: any;
  let testOrder: any;
  let testOrderItem: any;

  beforeAll(async () => {
    // Crear instancias reales
    orderRepository = new OrderRepository();
    orderService = new OrderService(orderRepository);

    // Crear usuarios de prueba
    testUser = await setupTestUser();
    testMenuItem = await setupTestMenuItem();
    testOrder = await setupTestOrder();
    testOrderItem = await setupTestOrderItem();
  }, 5000);

  beforeEach(async () => {
    // Limpiar datos antes de cada test
    await cleanupTestData();
  });

  afterAll(async () => {
    // Desconectar de la base de datos
    await testDatabaseClient.$disconnect();
  }, 5000);

  describe("createOrder", () => {
    test("should create order in database successfully", async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: testUser.tables[0].id,
        type: OrderType.DINE_IN,
        items: [
          {
            menuItemId: testMenuItem.id,
            quantity: 2,
            notes: "Sin cebolla",
          },
        ],
      };

      // Act
      const result = await orderService.createOrder(waiterId, orderData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(result.items).toHaveLength(1);
    });

    test("should create order with multiple items", async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: testUser.tables[0].id,
        type: OrderType.DINE_IN,
        items: [
          {
            menuItemId: testMenuItem.id,
            quantity: 2,
            notes: "Sin cebolla",
          },
          {
            menuItemId: testMenuItem.id,
            quantity: 1,
            notes: "Extra queso",
          },
        ],
      };

      // Act
      const result = await orderService.createOrder(waiterId, orderData);

      // Assert
      expect(result).toBeDefined();
      expect(result.items).toHaveLength(2);
      expect(result.items[0].quantity).toBe(2);
      expect(result.items[1].notes).toBe("Extra queso");
    });

    test("should calculate total amount correctly", async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: testUser.tables[0].id,
        type: OrderType.DINE_IN,
        items: [
          {
            menuItemId: testMenuItem.id,
            quantity: 2,
            notes: "Sin cebolla",
          },
          {
            menuItemId: testMenuItem.id,
            quantity: 1,
            notes: "Extra queso",
          },
        ],
      };

      // Act
      const result = await orderService.createOrder(waiterId, orderData);

      // Assert
      const expectedTotal =
        testMenuItem.price.toNumber() * 2 + testMenuItem.price.toNumber() * 1;
      expect(result.totalAmount.toString()).toBe(expectedTotal.toString());
    });

    test("should throw error for empty items", async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: testUser.tables[0].id,
        type: OrderType.DINE_IN,
        items: [],
      };

      // Act & Assert
      await expect(
        orderService.createOrder(waiterId, orderData),
      ).rejects.toThrow();
    });

    test("should throw error for invalid tableId", async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: "invalid",
        type: OrderType.DINE_IN,
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      // Act & Assert
      await expect(
        orderService.createOrder(waiterId, orderData),
      ).rejects.toThrow();
    });

    test("should handle database errors", async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: 1,
        type: OrderType.DINE_IN,
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      // Act
      const error = new Error("Database connection failed");
      orderRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(
        orderService.createOrder(waiterId, orderData),
      ).rejects.toThrow("Database connection failed");
      expect(orderRepository.create).toHaveBeenCalledWith(waiterId, orderData);
    });
  });

  describe("findOrderById", () => {
    test("should find order by id successfully", async () => {
      // Arrange
      const orderId = testOrder.id;

      // Act
      const result = await orderService.findOrderById(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(orderId);
    });

    test("should return null when order not found", async () => {
      // Arrange
      const orderId = "non-existent-id";

      // Act
      const result = await orderService.findOrderById(orderId);

      // Assert
      expect(result).toBeNull();
    });

    test("should handle repository errors", async () => {
      // Arrange
      const orderId = testOrder.id;
      const error = new Error("Database connection failed");
      orderRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(orderService.findOrderById(orderId)).rejects.toThrow(
        "Database connection failed",
      );
      expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
    });
  });

  describe("updateOrderStatus", () => {
    test("should update order status successfully", async () => {
      // Arrange
      const orderId = testOrder.id;
      const newStatus = OrderStatus.IN_KITCHEN;

      // Act
      const result = await orderService.updateOrderStatus(orderId, {
        status: newStatus,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.IN_KITCHEN);
    });

    test("should throw error for invalid status transitions", async () => {
      // Arrange
      const orderId = testOrder.id;
      const invalidStatus = "INVALID_STATUS" as OrderStatus;

      // Act & Assert
      await expect(
        orderService.updateOrderStatus(orderId, { status: invalidStatus }),
      ).rejects.toThrow();
    });
  });

  describe("cancelOrder", () => {
    test("should cancel order successfully", async () => {
      // Arrange
      const orderId = testOrder.id;
      const cancelledOrder = { ...testOrder, status: OrderStatus.CANCELLED };

      orderRepository.cancel.mockResolvedValue(cancelledOrder);

      // Act
      const result = await orderService.cancelOrder(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(orderRepository.cancel).toHaveBeenCalledWith(orderId);
    });

    test("should handle errors when cancelling order", async () => {
      // Arrange
      const orderId = testOrder.id;
      const error = new Error("Cannot cancel order");

      orderRepository.cancel.mockRejectedValue(error);

      // Act & Assert
      await expect(orderService.cancelOrder(orderId)).rejects.toThrow(
        "Cannot cancel order",
      );
      expect(orderRepository.cancel).toHaveBeenCalledWith(orderId);
    });
  });

  describe("findAllOrders", () => {
    test("should return paginated orders successfully", async () => {
      // Arrange
      const params = { page: 1, limit: 10 };

      // Act
      const testOrders = [await setupTestOrder(), await setupTestOrder()];

      // Mock response
      orderRepository.findAll.mockResolvedValue({
        data: testOrders,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });

      // Act
      const result = await orderService.findAllOrders(params);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(2);
    });

    test("should return empty list when no orders exist", async () => {
      // Arrange
      // Mock empty response
      orderRepository.findAll.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      // Act
      const result = await orderService.findAllOrders(params);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    test("should handle pagination correctly", async () => {
      // Arrange
      const params1 = { page: 1, limit: 5 };
      const params2 = { page: 2, limit: 5 };

      const testOrders1 = await orderService.findAllOrders(params1);
      const testOrders2 = await orderService.findAllOrders(params2);

      // Mock responses
      orderRepository.findAll
        .mockResolvedValueOnce({ data: testOrders1 })
        .mockResolvedValueOnce({ data: testOrders2 });

      // Act
      const result1 = await orderService.findAllOrders(params1);
      const result2 = await orderService.findAllOrders(params2);

      // Assert
      expect(result1.data).toHaveLength(5);
      expect(result1.meta.page).toBe(2);
      expect(result1.meta.total).toBe(7); // 2 + 5
      expect(result1.meta.totalPages).toBe(2);
    });
  });

  test("order workflow", () => {
    test("should handle complete order lifecycle", async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: testUser.tables[0].id,
        type: OrderType.DINE_IN,
        items: [
          {
            menuItemId: testMenuItem.id,
            quantity: 2,
            notes: "Sin cebolla",
          },
        ],
      };

      // Act - Complete workflow
      const order = await orderService.createOrder(waiterId, orderData);
      expect(order.status).toBe(OrderStatus.PENDING);

      // Act - Send to cashier
      const sentToCashier = await orderService.updateOrderStatus(order.id, {
        status: OrderStatus.SENT_TO_CASHIER,
      });
      expect(sentToCashier.status).toBe(OrderStatus.SENT_TO_CASHIER);

      // Act - Mark as paid
      const paid = await orderService.updateOrderStatus(order.id, {
        status: OrderStatus.PAID,
      });
      expect(paid.status).toBe(OrderStatus.PAID);

      // Act - Send to kitchen
      const inKitchen = await orderService.updateOrderStatus(order.id, {
        status: OrderStatus.IN_KITCHEN,
      });
      expect(inKitchen.status).toBe(OrderStatus.IN_KITCHEN);

      // Act - Mark as ready
      const ready = await orderService.updateOrderStatus(order.id, {
        status: OrderStatus.READY,
      });
      expect(ready.status).toBe(OrderStatus.READY);

      // Act - Deliver
      const delivered = await orderService.updateOrderStatus(order.id, {
        status: OrderStatus.DELIVERED,
      });
      expect(delivered.status).toBe(OrderStatus.DELIVERED);

      // Assert - Final state in database
      const finalOrder = await orderService.findOrderById(order.id);
      expect(finalOrder?.status).toBe(OrderStatus.DELIVERED);
    });
  });
});
