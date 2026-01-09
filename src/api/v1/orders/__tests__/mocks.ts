import { OrderRepositoryInterface } from "../interfaces/order.repository.interface";
import { UserServiceInterface } from "../users/interfaces/user.service.interface";
import { OrderServiceInterface } from "../interfaces/order.service.interface";
import { UserRepositoryInterface } from "../users/interfaces/user.repository.interface";
import { CustomError } from "../../types/custom-errors";
import {
  OrderStatus,
  OrderType,
  InventoryType,
} from "../../types/prisma.types";
import { Prisma } from "@prisma/client";

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

// Mock factory for UserRepository
export const createMockUserRepository =
  (): jest.Mocked<UserRepositoryInterface> => ({
    findAll: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUserWithPermissions: jest.fn(),
  });

// Mock factory for OrderService
export const createMockOrderService =
  (): jest.Mocked<OrderServiceInterface> => ({
    findAllOrders: jest.fn(),
    findOrderById: jest.fn(),
    createOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
    cancelOrder: jest.fn(),
  });

// Mock factory for UserService
export const createMockUserService = (): jest.Mocked<UserServiceInterface> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  register: jest.fn(),
  updateUser: jest.fn(),
  findUserWithRolesAndPermissions: jest.fn(),
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
