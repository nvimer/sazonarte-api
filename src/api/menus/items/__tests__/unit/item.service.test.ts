// Mock getPrismaClient BEFORE imports
const mockPrismaClient = {
  menuItem: {
    findUnique: jest.fn(),
  },
};

jest.mock("../../../../../database/prisma", () => ({
  __esModule: true,
  default: {},
  getPrismaClient: jest.fn(() => mockPrismaClient),
}));

import { MenuItem } from "@prisma/client";
import { ItemService } from "../../item.service";
import { ItemRepositoryInterface } from "../../interfaces/item.repository.interface";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../../interfaces/pagination.interfaces";
import { createMenuItemFixture, createMockItemRepository } from "../helpers";

describe("ItemService - Basic Test", () => {
  let itemService: ItemService;
  let mockItemRepository: jest.Mocked<ItemRepositoryInterface>;

  // Use fixture from helpers - alias for backward compatibility
  const createMockItem = createMenuItemFixture;

  const createPaginatedResponse = <T>(
    data: T[],
    overrides: Partial<PaginatedResponse<T>["meta"]> = {},
  ): PaginatedResponse<T> => ({
    data,
    meta: {
      total: data.length,
      page: 1,
      limit: 10,
      totalPages: Math.ceil(data.length / 10) || 1,
      hasNextPage: false,
      hasPreviousPage: false,
      ...overrides,
    },
  });

  beforeEach(() => {
    // Create fresh mock repository for each test using helper
    mockItemRepository = createMockItemRepository();

    // Instance item service with mock
    itemService = new ItemService(mockItemRepository);
  });

  describe("findAll", () => {
    it("should return when found all items", async () => {
      // Arrange
      const mockItems = [
        createMockItem({ id: 2, name: "Pechuga a la plancha" }),
        createMockItem({ id: 3, name: "Chuleta de cerdo" }),
        createMockItem({ id: 4, name: "Chuleta de pollo" }),
      ];
      const params: PaginationParams = { page: 1, limit: 10 };
      const expectedResponse = createPaginatedResponse(mockItems);

      mockItemRepository.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await itemService.findAllMenuItems(params);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.data).toHaveLength(3);
      expect(mockItemRepository.findAll).toHaveBeenCalledWith(params);
      expect(mockItemRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should handle empty results", async () => {
      // Arrange
      const params: PaginationParams = { page: 1, limit: 10 };
      const expectedResponse = createPaginatedResponse<MenuItem>([], {
        total: 0,
        totalPages: 0,
      });

      mockItemRepository.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await itemService.findAllMenuItems(params);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe("findMenuItemById", () => {
    it("should return when found", async () => {
      // Arrange
      const mockItem = createMenuItemFixture({ id: 5 });
      mockPrismaClient.menuItem.findUnique.mockResolvedValue(mockItem);

      // Act
      const result = await itemService.findMenuItemById(5);

      // Assert
      expect(result).toEqual(mockItem);
      expect(mockPrismaClient.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });

    it("should throw NotFound when item does not exist", async () => {
      // Arrange
      mockPrismaClient.menuItem.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(itemService.findMenuItemById(999)).rejects.toThrow(
        "Menu Item ID 999 not found",
      );
    });
  });

  describe("deductStockForOrder", () => {
    // TODO: Add tests for deductStockForOrder
    it.todo("should deduct stock for tracked items");
    it.todo("should skip deduction for unlimited items");
  });
});
