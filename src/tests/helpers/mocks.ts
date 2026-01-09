import { OrderRepositoryInterface } from "../../api/v1/orders/interfaces/order.repository.interface";
import { OrderStatus, OrderType } from "../../types/prisma.types";
import { CustomError } from "../../types/custom-errors";

// Mock factory for OrderRepository
export const createMockOrderRepository =
  (): jest.Mocked<OrderRepositoryInterface> => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    cancel: jest.fn(),
    updateTotal: jest.fn(),
  });

// Test payload builders
export const createValidOrderPayload = () => ({
  tableId: 1,
  type: "DINE_IN" as OrderType,
  items: [
    {
      menuItemId: 1,
      quantity: 2,
      notes: "Sin cebolla",
    },
  ],
});

export const createInvalidOrderPayload = () => ({
  tableId: "invalid", // Should be number
  type: "INVALID_TYPE", // Invalid enum
  items: [], // Empty array
});

// Error helpers
export const createMockCustomError = (
  message: string = "Test error",
  statusCode: number = 400,
  errorCode?: string,
): CustomError => {
  const error = new CustomError(message, statusCode, errorCode);
  return error;
};
