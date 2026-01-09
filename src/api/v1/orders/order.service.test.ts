import OrderService from "./order.service";
import { OrderRepositoryInterface } from "./interfaces/order.repository.interface";
import { OrderStatus, OrderType } from "../../types/prisma.types";
import { CustomError } from "../../types/custom-errors";
import {
  createMockOrderRepository,
  createValidOrderPayload,
  createMockCustomError,
} from "../tests/helpers/mocks";

// Mock dependencies
jest.mock("./order.repository");
jest.mock("../menus/items/item.service");

describe("OrderService", () => {
  let service: OrderService;
  let mockOrderRepository: jest.Mocked<OrderRepositoryInterface>;

  beforeEach(() => {
    mockOrderRepository = createMockOrderRepository();
    service = new OrderService(mockOrderRepository);

    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    test("should create order successfully with valid data", async () => {
      // Arrange
      const waiterId = "waiter-123";
      const orderData = createValidOrderPayload();
      const expectedOrder = {
        id: "order-123",
        status: OrderStatus.PENDING,
        type: OrderType.DINE_IN,
        totalAmount: expect.any(Number),
        items: expect.any(Array),
      };

      mockOrderRepository.create.mockResolvedValue(expectedOrder as any);

      // Act
      const result = await service.createOrder(waiterId, orderData);

      // Assert
      expect(result).toBeDefined();
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        waiterId,
        orderData,
      );
    });

    test("should throw error when order has no items", async () => {
      // Arrange
      const waiterId = "waiter-123";
      const orderData = {
        tableId: 1,
        type: OrderType.DINE_IN,
        items: [], // Empty array
      };

      // Act & Assert
      await expect(service.createOrder(waiterId, orderData)).rejects.toThrow(
        CustomError,
      );
    });

    test("should throw error when repository fails", async () => {
      // Arrange
      const waiterId = "waiter-123";
      const orderData = createValidOrderPayload();
      const expectedError = createMockCustomError("Database error", 500);

      mockOrderRepository.create.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(service.createOrder(waiterId, orderData)).rejects.toThrow(
        "Database error",
      );
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        waiterId,
        orderData,
      );
    });
  });

  describe("findOrderById", () => {
    test("should find order by id successfully", async () => {
      // Arrange
      const orderId = "order-123";
      const expectedOrder = {
        id: orderId,
        status: OrderStatus.PENDING,
        items: [],
      };

      mockOrderRepository.findById.mockResolvedValue(expectedOrder as any);

      // Act
      const result = await service.findOrderById(orderId);

      // Assert
      expect(result).toEqual(expectedOrder);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    });

    test("should return null when order not found", async () => {
      // Arrange
      const orderId = "non-existent-order";
      mockOrderRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.findOrderById(orderId);

      // Assert
      expect(result).toBeNull();
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    });

    test("should handle repository errors", async () => {
      // Arrange
      const orderId = "order-123";
      const expectedError = createMockCustomError("Connection failed", 500);

      mockOrderRepository.findById.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(service.findOrderById(orderId)).rejects.toThrow(
        "Connection failed",
      );
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    });
  });

  describe("updateOrderStatus", () => {
    test("should update order status successfully", async () => {
      // Arrange
      const orderId = "order-123";
      const newStatus = OrderStatus.IN_KITCHEN;
      const expectedOrder = {
        id: orderId,
        status: newStatus,
      };

      mockOrderRepository.updateStatus.mockResolvedValue(expectedOrder as any);

      // Act
      const result = await service.updateOrderStatus(orderId, newStatus);

      // Assert
      expect(result).toEqual(expectedOrder);
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(
        orderId,
        newStatus,
      );
    });

    test("should throw error for invalid status transition", async () => {
      // Arrange
      const orderId = "order-123";
      const invalidStatus = "INVALID_STATUS" as any;

      // Act & Assert
      await expect(
        service.updateOrderStatus(orderId, invalidStatus),
      ).rejects.toThrow();
    });
  });

  describe("cancelOrder", () => {
    test("should cancel order successfully", async () => {
      // Arrange
      const orderId = "order-123";
      const expectedOrder = {
        id: orderId,
        status: OrderStatus.CANCELLED,
      };

      mockOrderRepository.cancel.mockResolvedValue(expectedOrder as any);

      // Act
      const result = await service.cancelOrder(orderId);

      // Assert
      expect(result).toEqual(expectedOrder);
      expect(mockOrderRepository.cancel).toHaveBeenCalledWith(orderId);
    });

    test("should handle errors when cancelling order", async () => {
      // Arrange
      const orderId = "order-123";
      const expectedError = createMockCustomError("Cannot cancel order", 400);

      mockOrderRepository.cancel.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(service.cancelOrder(orderId)).rejects.toThrow(
        "Cannot cancel order",
      );
      expect(mockOrderRepository.cancel).toHaveBeenCalledWith(orderId);
    });
  });
});
