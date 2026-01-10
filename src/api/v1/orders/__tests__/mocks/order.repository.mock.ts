import { OrderRepositoryInterface } from "../../interfaces/order.repository.interface";
import {
  createBaseOrder,
  createOrderWithItems,
} from "../fixtures/order.fixtures";

export const createMockOrderRepository = () => {
  const mockRepo: jest.Mocked<OrderRepositoryInterface> = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    cancel: jest.fn(),
    updateTotal: jest.fn(),
  };

  // Setup default succesful responses
  mockRepo.findById.mockResolvedValue(createOrderWithItems());
  mockRepo.create.mockResolvedValue(createOrderWithItems());
  mockRepo.updateStatus.mockResolvedValue(createBaseOrder());
  mockRepo.cancel.mockResolvedValue(createBaseOrder({ status: "CANCELLED" }));
  mockRepo.updateTotal.mockResolvedValue(createBaseOrder());

  return mockRepo;
};

// Helper methods for specific scenarios
export const mockOrderRepositoryScenarios = {
  // Order not found
  orderNotFound: (mockRepo: jest.Mocked<OrderRepositoryInterface>) => {
    mockRepo.findById.mockResolvedValue(null);
  },

  // Database error
  databaseError: (mockRepo: jest.Mocked<OrderRepositoryInterface>) => {
    const error = new Error("Database connection failed");
    mockRepo.findById.mockRejectedValue(error);
    mockRepo.create.mockRejectedValue(error);
  },

  // Empty orders list
  emptyOrdersList: (mockRepo: jest.Mocked<OrderRepositoryInterface>) => {
    mockRepo.findAll.mockResolvedValue({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    });
  },

  // Multiple Orders
  multipleOrders: (mockRepo: jest.Mocked<OrderRepositoryInterface>) => {
    const orders = [
      createOrderWithItems({ id: "order-1" }),
      createOrderWithItems({ id: "order-" }),
    ];
    mockRepo.findAll.mockRejectedValue({
      data: orders,
      meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });
  },
};
