import { Prisma } from "@prisma/client";
import { OrderStatus, OrderType } from "../../../../types/prisma.types";
import { OrderRepositoryInterface } from "../../interfaces/order.repository.interface";
import { OrderService } from "../../order.service";
import { ItemServiceInterface } from "../../../menus/items/interfaces/item.service.interface";
import { createMockOrderRepository, createMockItemService } from "../helpers";
import {
  createOrderFixture,
  createOrderWithItemsFixture,
  createOrderWithRelationsFixture,
} from "../helpers/order.fixtures";
import { createMenuItemFixture } from "../../../menus/items/__tests__/helpers";

describe("OrderService - Basic Tests", () => {
  let orderService: OrderService; // ✅ Instancia REAL del servicio
  let mockOrderRepository: jest.Mocked<OrderRepositoryInterface>;
  let mockItemService: jest.Mocked<
    Pick<
      ItemServiceInterface,
      "findMenuItemById" | "deductStockForOrder" | "revertStockForOrder"
    >
  >;

  beforeEach(() => {
    // Mock de dependencias (NO del servicio que estás testeando)
    mockOrderRepository = createMockOrderRepository();
    mockItemService = createMockItemService();

    // ✅ Crear instancia REAL del servicio con mocks de dependencias inyectadas
    orderService = new OrderService(mockOrderRepository, mockItemService);

    jest.clearAllMocks();
  });

  describe("basic functionality", () => {
    test("should be defined", () => {
      expect(orderService).toBeDefined();
      expect(orderService).toBeInstanceOf(OrderService);
    });
  });

  describe("createOrder method", () => {
    test("should create order with valid items and deduct stock", async () => {
      // Arrange
      const waiterId = "waiter-123";
      const orderData = {
        tableId: 1,
        type: OrderType.DINE_IN,
        items: [{ menuItemId: 1, quantity: 2 }],
      };

      const mockMenuItem = createMenuItemFixture({
        id: 1,
        isAvailable: true,
        stockQuantity: 50,
        inventoryType: "TRACKED",
        price: new Prisma.Decimal("14000"),
      });

      // Order después de crear (sin items aún)
      const createdOrder = createOrderFixture({
        id: "order-123",
        waiterId,
        tableId: 1,
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        totalAmount: new Prisma.Decimal("0"),
      });

      // Order completo con items (lo que retorna findById al final)
      const orderWithItems = createOrderWithItemsFixture({
        id: "order-123",
        waiterId,
        tableId: 1,
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        totalAmount: new Prisma.Decimal("28000"), // 2 * 14000
      });

      // Mock ItemService - ahora inyectado, no necesita jest.mock()
      mockItemService.findMenuItemById.mockResolvedValue(mockMenuItem);
      mockItemService.deductStockForOrder.mockResolvedValue(undefined);

      // Mock Repository - create retorna order básico
      mockOrderRepository.create.mockResolvedValue(createdOrder as any);
      // updateTotal retorna order actualizado
      mockOrderRepository.updateTotal.mockResolvedValue({
        ...createdOrder,
        totalAmount: new Prisma.Decimal("28000"),
      } as any);
      // findById retorna order completo con items
      mockOrderRepository.findById.mockResolvedValue(orderWithItems as any);

      // Act
      const result = await orderService.createOrder(waiterId, orderData);

      // Assert - Verifica la lógica REAL del servicio
      expect(mockItemService.findMenuItemById).toHaveBeenCalledWith(1);
      expect(mockItemService.deductStockForOrder).toHaveBeenCalledWith(
        1,
        2,
        "order-123",
      );
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        waiterId,
        expect.objectContaining({
          tableId: 1,
          type: OrderType.DINE_IN,
          items: expect.arrayContaining([
            expect.objectContaining({
              menuItemId: 1,
              quantity: 2,
              priceAtOrder: new Prisma.Decimal("14000"),
            }),
          ]),
        }),
      );
      expect(mockOrderRepository.updateTotal).toHaveBeenCalledWith(
        "order-123",
        28000,
      );
      expect(mockOrderRepository.findById).toHaveBeenCalledWith("order-123");
      expect(result).toEqual(orderWithItems);
    });
  });

  describe("findOrderById method", () => {
    test("should return order when found", async () => {
      // Arrange
      const orderId = "order-123";
      const expectedOrder = createOrderWithRelationsFixture({
        id: orderId,
        status: OrderStatus.PENDING,
        waiterId: "waiter-123",
      });
      mockOrderRepository.findById.mockResolvedValue(expectedOrder as any);

      // Act
      const result = await orderService.findOrderById(orderId);

      // Assert - Verifica la lógica REAL
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(expectedOrder);
    });

    test("should throw error when order not found", async () => {
      // Arrange
      const orderId = "non-existent";
      mockOrderRepository.findById.mockResolvedValue(null);

      // Act & Assert - Verifica que el servicio lanza error real
      await expect(orderService.findOrderById(orderId)).rejects.toThrow(
        "Order with ID non-existent not found",
      );
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    });
  });

  describe("updateOrderStatus method", () => {
    test("should update order status when order exists", async () => {
      // Arrange
      const orderId = "order-123";
      const status = OrderStatus.IN_KITCHEN;
      const existingOrder = createOrderWithRelationsFixture({
        id: orderId,
        status: OrderStatus.PENDING,
        waiterId: "waiter-123",
      });
      const updatedOrder = createOrderFixture({
        id: orderId,
        status,
        waiterId: "waiter-123",
      });

      mockOrderRepository.findById.mockResolvedValue(existingOrder as any);
      mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder as any);

      // Act
      const result = await orderService.updateOrderStatus(orderId, {
        status,
      });

      // Assert - Verifica la lógica REAL
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(
        orderId,
        status,
      );
      expect(result).toEqual(updatedOrder);
    });

    test("should throw error when trying to update delivered order", async () => {
      // Arrange
      const orderId = "order-123";
      const deliveredOrder = createOrderWithRelationsFixture({
        id: orderId,
        status: OrderStatus.DELIVERED,
      });

      mockOrderRepository.findById.mockResolvedValue(deliveredOrder as any);

      // Act & Assert
      await expect(
        orderService.updateOrderStatus(orderId, {
          status: OrderStatus.PENDING,
        }),
      ).rejects.toThrow("Cannot change status of delivered order");
    });

    test("should throw error when trying to update cancelled order", async () => {
      // Arrange
      const orderId = "order-123";
      const cancelledOrder = createOrderWithRelationsFixture({
        id: orderId,
        status: OrderStatus.CANCELLED,
      });

      mockOrderRepository.findById.mockResolvedValue(cancelledOrder as any);

      // Act & Assert
      await expect(
        orderService.updateOrderStatus(orderId, {
          status: OrderStatus.PENDING,
        }),
      ).rejects.toThrow("Cannot change status of cancelled order");
    });
  });

  describe("cancelOrder method", () => {
    test("should cancel order when order exists and revert stock", async () => {
      // Arrange
      const orderId = "order-123";
      // Order debe tener items con menuItem para que el servicio pueda revertir stock
      const existingOrder = createOrderWithItemsFixture({
        id: orderId,
        status: OrderStatus.PENDING,
        waiterId: "waiter-123",
      });
      const cancelledOrder = createOrderFixture({
        id: orderId,
        status: OrderStatus.CANCELLED,
        waiterId: "waiter-123",
      });

      mockOrderRepository.findById.mockResolvedValue(existingOrder as any);
      mockOrderRepository.cancel.mockResolvedValue(cancelledOrder as any);
      mockItemService.revertStockForOrder.mockResolvedValue(undefined);

      // Act
      const result = await orderService.cancelOrder(orderId);

      // Assert - Verifica la lógica REAL
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      // Verifica que se revierte stock para items TRACKED
      expect(mockItemService.revertStockForOrder).toHaveBeenCalledWith(
        1, // menuItemId
        2, // quantity
        orderId,
      );
      expect(mockOrderRepository.cancel).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(cancelledOrder);
    });

    test("should throw error when trying to cancel delivered order", async () => {
      // Arrange
      const orderId = "order-123";
      const deliveredOrder = createOrderWithItemsFixture({
        id: orderId,
        status: OrderStatus.DELIVERED,
      });

      mockOrderRepository.findById.mockResolvedValue(deliveredOrder as any);

      // Act & Assert
      await expect(orderService.cancelOrder(orderId)).rejects.toThrow(
        "Cannot cancel delivered order",
      );
      expect(mockOrderRepository.cancel).not.toHaveBeenCalled();
    });

    test("should throw error when trying to cancel already cancelled order", async () => {
      // Arrange
      const orderId = "order-123";
      const cancelledOrder = createOrderWithItemsFixture({
        id: orderId,
        status: OrderStatus.CANCELLED,
      });

      mockOrderRepository.findById.mockResolvedValue(cancelledOrder as any);

      // Act & Assert
      await expect(orderService.cancelOrder(orderId)).rejects.toThrow(
        "Cannot cancel cancelled order",
      );
      expect(mockOrderRepository.cancel).not.toHaveBeenCalled();
    });
  });

  describe("findAllOrders method", () => {
    test("should return paginated orders from repository", async () => {
      // Arrange
      const params = { page: 1, limit: 10 };
      const expectedResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockOrderRepository.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await orderService.findAllOrders(params);

      // Assert - Verifica que delega al repositorio (lógica REAL)
      expect(mockOrderRepository.findAll).toHaveBeenCalledWith(params);
      expect(result).toEqual(expectedResponse);
    });

    test("should return empty list when no orders exist", async () => {
      // Arrange
      const params = { page: 1, limit: 10 };
      const expectedResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockOrderRepository.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await orderService.findAllOrders(params);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });
});
