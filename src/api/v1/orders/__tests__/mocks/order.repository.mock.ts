import { OrderRepositoryInterface } from "../../interfaces/order.repository.interface";

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
