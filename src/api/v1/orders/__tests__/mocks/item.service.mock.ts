import {
  createTrackedMenuItem,
  createUnavailableMenuItem,
} from "../fixtures/menu-item.fixtures";

export const createMockItemService = () => {
  const mockService = {
    findMenuItemById: jest.fn(),
    deductStockForOrder: jest.fn(),
  };

  // Setup default responses
  mockService.findMenuItemById.mockResolvedValue(createTrackedMenuItem());
  mockService.deductStockForOrder.mockResolvedValue(true);

  return mockService;
};

export const mockItemServiceScenarios = {
  itemNotFound: (mockService: any) => {
    mockService.findMenuItemById.mockResolvedValue(null);
  },

  itemUnavailable: (mockService: any) => {
    mockService.findMenuItemById.mockResolvedValue(createUnavailableMenuItem());
  },

  stockDeductionFailed: (mockService: any) => {
    mockService.deductStockForOrder.mockRejectedValue(
      new Error("Insufficient stock"),
    );
  },
};
