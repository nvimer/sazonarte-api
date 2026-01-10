import { createValidOrderPayload } from "../../api/v1/orders/__tests__/mocks";
import { OrderRepositoryInterface } from "../../api/v1/orders/interfaces/order.repository.interface";
import { OrderServiceInterface } from "../../api/v1/orders/interfaces/order.service.interface";
import { OrderStatus } from "../../types/prisma.types";
import { testDatabaseClient } from "../setup";

describe("OrderService - Integration Tests", () => {
  let orderService: OrderServiceInterface;
  let orderRepository: OrderRepositoryInterface;
  let testUser: any;
  let testMenuItem: any;

  beforeAll(async () => {
    orderRepository = new OrderRepository(testDatabaseClient);
    orderService = new OrderService(orderRepository);

    // Setup test data
    testUser = await setupTestUser(testDatabaseClient);
    testMenuItem = await setupTestMenuItem(testDatabaseClient);
  });

  beforeEach(async () => {
    // Clean up orders before each test
    await testDatabaseClient.order.deleteMany();
  });

  afterAll(async () => {
    await testDatabaseClient.$disconnect();
  });

  describe("createOrder", () => {
    test("should create order in database successfully", async () => {
      // Arrange
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;

      // Act
      const result = await orderService.createOrder(testUser.id, orderData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.waiterId).toBe(testUser.id);
      expect(result.items).toHaveLength(1);

      // Verify in database
      const dbOrder = await testDatabaseClient.order.findUnique({
        where: { id: result.id },
        include: { items: true },
      });
      expect(dbOrder).not.toBeNull();
      expect(dbOrder?.status).toBe(OrderStatus.PENDING);
    });

    test("should persist order items correctly", async () => {
      // Arrange
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;
      orderData.items[0].notes = "Extra queso";

      // Act
      const result = await orderService.createOrder(testUser.id, orderData);

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.items[0].notes).toBe("Extra queso");
      expect(result.items[0].priceAtOrder).toBe(testMenuItem.price);

      // Verify in database
      const dbOrderItems = await testDatabaseClient.orderItem.findMany({
        where: { orderId: result.id },
      });
      expect(dbOrderItems).toHaveLength(1);
      expect(dbOrderItems[0].notes).toBe("Extra queso");
    });

    test("should handle database constraints", async () => {
      // Arrange
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = 999; // Non-existent menu item

      // Act & Assert
      await expect(
        orderService.createOrder(testUser.id, orderData),
      ).rejects.toThrow();
    });
  });

  describe("findOrderById", () => {
    test("should retrieve order with items from database", async () => {
      // Arrange
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;
      const createdOrder = await orderService.createOrder(
        testUser.id,
        orderData,
      );

      // Act
      const result = await orderService.findOrderById(createdOrder.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(createdOrder.id);
      expect(result?.items).toHaveLength(1);
      expect(result?.items[0].menuItem.name).toBe(testMenuItem.name);
    });

    test("should return null for non-existent order", async () => {
      // Act
      const result = await orderService.findOrderById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("updateOrderStatus", () => {
    test("should update status in database", async () => {
      // Arrange
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;
      const createdOrder = await orderService.createOrder(
        testUser.id,
        orderData,
      );

      // Act
      const result = await orderService.updateOrderStatus(
        createdOrder.id,
        OrderStatus.IN_KITCHEN,
      );

      // Assert
      expect(result.status).toBe(OrderStatus.IN_KITCHEN);

      // Verify in database
      const dbOrder = await testDatabaseClient.order.findUnique({
        where: { id: createdOrder.id },
      });
      expect(dbOrder?.status).toBe(OrderStatus.IN_KITCHEN);
    });
  });

  describe("order workflow", () => {
    test("should handle complete order lifecycle", async () => {
      // Arrange
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;

      // Act - Create order
      const order = await orderService.createOrder(testUser.id, orderData);
      expect(order.status).toBe(OrderStatus.PENDING);

      // Act - Send to cashier
      const sentToCashier = await orderService.updateOrderStatus(
        order.id,
        OrderStatus.SENT_TO_CASHIER,
      );
      expect(sentToCashier.status).toBe(OrderStatus.SENT_TO_CASHIER);

      // Act - Mark as paid
      const paid = await orderService.updateOrderStatus(
        order.id,
        OrderStatus.PAID,
      );
      expect(paid.status).toBe(OrderStatus.PAID);

      // Act - Send to kitchen
      const inKitchen = await orderService.updateOrderStatus(
        order.id,
        OrderStatus.IN_KITCHEN,
      );
      expect(inKitchen.status).toBe(OrderStatus.IN_KITCHEN);

      // Act - Mark as ready
      const ready = await orderService.updateOrderStatus(
        order.id,
        OrderStatus.READY,
      );
      expect(ready.status).toBe(OrderStatus.READY);

      // Act - Deliver
      const delivered = await orderService.updateOrderStatus(
        order.id,
        OrderStatus.DELIVERED,
      );
      expect(delivered.status).toBe(OrderStatus.DELIVERED);

      // Assert - Final state in database
      const finalOrder = await testDatabaseClient.order.findUnique({
        where: { id: order.id },
      });
      expect(finalOrder?.status).toBe(OrderStatus.DELIVERED);
    });
  });
});
