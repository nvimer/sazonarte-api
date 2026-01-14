import { PrismaClient } from "@prisma/client";
import { StockService } from "../../stock.service";
import { StockRepository } from "../../stock.repository";
import {
  createMockStockRepository,
  createMockPrismaClient,
} from "../helpers/stock.mocks";
import {
  createTrackedMenuItemFixture,
  createUnlimitedMenuItemFixture,
  createStockAdjustmentFixture,
} from "../helpers/stock.fixtures";
import {
  DailyStockResetRequest,
  AddStockRequest,
  RemoveStockRequest,
  InventoryTypeRequest,
} from "../../stock.types";
import { InventoryType } from "../../../../../../types/prisma.types";

describe("StockService - Unit Tests", () => {
  let stockService: StockService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockStockRepository: jest.Mocked<StockRepository>;
  let mockTransaction: jest.Mock;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    mockStockRepository = createMockStockRepository();
    stockService = new StockService(mockStockRepository);

    // Setup transaction mock
    mockTransaction = jest.fn((callback) => {
      const mockTx = {} as Parameters<typeof callback>[0];
      return callback(mockTx);
    });
    mockPrisma.$transaction = mockTransaction;

    jest.clearAllMocks();
  });

  describe("dailyStockReset", () => {
    it("should reset stock for multiple items when valid data provided", async () => {
      // Arrange
      const userId = "user-123";
      const data: DailyStockResetRequest = {
        items: [
          { itemId: 1, quantity: 100, lowStockAlert: 10 },
          { itemId: 2, quantity: 50, lowStockAlert: 5 },
        ],
      };

      const item1 = createTrackedMenuItemFixture({
        id: 1,
        stockQuantity: 20,
        inventoryType: InventoryType.TRACKED,
      });
      const item2 = createTrackedMenuItemFixture({
        id: 2,
        stockQuantity: 10,
        inventoryType: InventoryType.TRACKED,
      });

      mockStockRepository.findByIdForUpdate
        .mockResolvedValueOnce(item1)
        .mockResolvedValueOnce(item2);

      const updatedItem1 = createTrackedMenuItemFixture({
        id: 1,
        stockQuantity: 100,
        initialStock: 100,
        lowStockAlert: 10,
        isAvailable: true,
      });
      const updatedItem2 = createTrackedMenuItemFixture({
        id: 2,
        stockQuantity: 50,
        initialStock: 50,
        lowStockAlert: 5,
        isAvailable: true,
      });

      mockStockRepository.updateStock
        .mockResolvedValueOnce(updatedItem1)
        .mockResolvedValueOnce(updatedItem2);

      mockStockRepository.createStockAdjustment
        .mockResolvedValueOnce(createStockAdjustmentFixture())
        .mockResolvedValueOnce(createStockAdjustmentFixture());

      // Act
      const result = await stockService.dailyStockReset(data, userId);

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockStockRepository.findByIdForUpdate).toHaveBeenCalledTimes(2);
      expect(mockStockRepository.updateStock).toHaveBeenCalledTimes(2);
      expect(mockStockRepository.createStockAdjustment).toHaveBeenCalledTimes(
        2,
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        itemId: 1,
        previousStock: 20,
        newStock: 100,
      });
    });

    it("should throw error when menu item not found", async () => {
      // Arrange
      const userId = "user-123";
      const data: DailyStockResetRequest = {
        items: [{ itemId: 999, quantity: 100 }],
      };

      mockStockRepository.findByIdForUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(
        stockService.dailyStockReset(data, userId),
      ).rejects.toThrow("Menu Item ID 999 not found");
    });

    it("should throw error when item is not TRACKED", async () => {
      // Arrange
      const userId = "user-123";
      const data: DailyStockResetRequest = {
        items: [{ itemId: 1, quantity: 100 }],
      };

      const unlimitedItem = createUnlimitedMenuItemFixture({ id: 1 });
      mockStockRepository.findByIdForUpdate.mockResolvedValue(unlimitedItem);

      // Act & Assert
      await expect(
        stockService.dailyStockReset(data, userId),
      ).rejects.toThrow("Only TRACKED items can have stock reset");
    });
  });

  describe("addStock", () => {
    it("should add stock to item when valid data provided", async () => {
      // Arrange
      const itemId = 1;
      const userId = "user-123";
      const data: AddStockRequest = {
        quantity: 10,
        reason: "Manual stock addition",
      };

      const item = createTrackedMenuItemFixture({
        id: itemId,
        stockQuantity: 50,
        inventoryType: InventoryType.TRACKED,
      });

      mockStockRepository.findByIdForUpdate.mockResolvedValue(item);

      const updatedItem = createTrackedMenuItemFixture({
        id: itemId,
        stockQuantity: 60,
        isAvailable: true,
      });

      mockStockRepository.updateStock.mockResolvedValue(updatedItem);
      mockStockRepository.createStockAdjustment.mockResolvedValue(
        createStockAdjustmentFixture(),
      );

      // Act
      const result = await stockService.addStock(itemId, data, userId);

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockStockRepository.findByIdForUpdate).toHaveBeenCalledWith(
        expect.anything(),
        itemId,
      );
      expect(mockStockRepository.updateStock).toHaveBeenCalledWith(
        expect.anything(),
        itemId,
        {
          stockQuantity: 60,
          isAvailable: true,
        },
      );
      expect(result).toEqual(updatedItem);
    });

    it("should throw error when menu item not found", async () => {
      // Arrange
      const itemId = 999;
      const userId = "user-123";
      const data: AddStockRequest = {
        quantity: 10,
        reason: "Test reason",
      };

      mockStockRepository.findByIdForUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(
        stockService.addStock(itemId, data, userId),
      ).rejects.toThrow("Menu Item ID 999 not found");
    });

    it("should throw error when item is UNLIMITED", async () => {
      // Arrange
      const itemId = 1;
      const userId = "user-123";
      const data: AddStockRequest = {
        quantity: 10,
        reason: "Test reason",
      };

      const unlimitedItem = createUnlimitedMenuItemFixture({ id: itemId });
      mockStockRepository.findByIdForUpdate.mockResolvedValue(unlimitedItem);

      // Act & Assert
      await expect(
        stockService.addStock(itemId, data, userId),
      ).rejects.toThrow("Cannot add stock to UNLIMITED items");
    });
  });

  describe("removeStock", () => {
    it("should remove stock from item when valid data provided", async () => {
      // Arrange
      const itemId = 1;
      const userId = "user-123";
      const data: RemoveStockRequest = {
        quantity: 10,
        reason: "Manual stock removal",
      };

      const item = createTrackedMenuItemFixture({
        id: itemId,
        stockQuantity: 50,
        inventoryType: InventoryType.TRACKED,
        isAvailable: true,
      });

      mockStockRepository.findByIdForUpdate.mockResolvedValue(item);

      const updatedItem = createTrackedMenuItemFixture({
        id: itemId,
        stockQuantity: 40,
        isAvailable: true,
      });

      mockStockRepository.updateStock.mockResolvedValue(updatedItem);
      mockStockRepository.createStockAdjustment.mockResolvedValue(
        createStockAdjustmentFixture(),
      );

      // Act
      const result = await stockService.removeStock(itemId, data, userId);

      // Assert
      expect(mockStockRepository.updateStock).toHaveBeenCalledWith(
        expect.anything(),
        itemId,
        {
          stockQuantity: 40,
          isAvailable: true,
        },
      );
      expect(result).toEqual(updatedItem);
    });

    it("should throw error when insufficient stock", async () => {
      // Arrange
      const itemId = 1;
      const userId = "user-123";
      const data: RemoveStockRequest = {
        quantity: 100,
        reason: "Test reason",
      };

      const item = createTrackedMenuItemFixture({
        id: itemId,
        stockQuantity: 50,
        inventoryType: InventoryType.TRACKED,
      });

      mockStockRepository.findByIdForUpdate.mockResolvedValue(item);

      // Act & Assert
      await expect(
        stockService.removeStock(itemId, data, userId),
      ).rejects.toThrow("Insufficient stock to remove");
    });

    it("should throw error when item is UNLIMITED", async () => {
      // Arrange
      const itemId = 1;
      const userId = "user-123";
      const data: RemoveStockRequest = {
        quantity: 10,
        reason: "Test reason",
      };

      const unlimitedItem = createUnlimitedMenuItemFixture({ id: itemId });
      mockStockRepository.findByIdForUpdate.mockResolvedValue(unlimitedItem);

      // Act & Assert
      await expect(
        stockService.removeStock(itemId, data, userId),
      ).rejects.toThrow("Cannot remove stock from UNLIMITED items");
    });
  });

  describe("getLowStockItems", () => {
    it("should return low stock items", async () => {
      // Arrange
      const lowStockItems = [
        createTrackedMenuItemFixture({ id: 1, stockQuantity: 3 }),
        createTrackedMenuItemFixture({ id: 2, stockQuantity: 4 }),
      ];

      mockStockRepository.findLowStockItems.mockResolvedValue(lowStockItems);

      // Act
      const result = await stockService.getLowStockItems();

      // Assert
      expect(mockStockRepository.findLowStockItems).toHaveBeenCalledTimes(1);
      expect(result).toEqual(lowStockItems);
    });
  });

  describe("getOutOfStockItems", () => {
    it("should return out of stock items", async () => {
      // Arrange
      const outOfStockItems = [
        createTrackedMenuItemFixture({ id: 1, stockQuantity: 0 }),
        createTrackedMenuItemFixture({ id: 2, stockQuantity: 0 }),
      ];

      mockStockRepository.findOutOfStockItems.mockResolvedValue(
        outOfStockItems,
      );

      // Act
      const result = await stockService.getOutOfStockItems();

      // Assert
      expect(mockStockRepository.findOutOfStockItems).toHaveBeenCalledTimes(1);
      expect(result).toEqual(outOfStockItems);
    });
  });

  describe("getStockHistory", () => {
    it("should return stock history for item", async () => {
      // Arrange
      const itemId = 1;
      const page = 1;
      const limit = 20;
      const history = {
        data: [
          {
            ...createStockAdjustmentFixture({ id: "adjustment-1" }),
            menuItem: { name: "Test Item 1" },
          },
          {
            ...createStockAdjustmentFixture({ id: "adjustment-2" }),
            menuItem: { name: "Test Item 2" },
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      mockStockRepository.findStockHistory.mockResolvedValue(history);

      // Act
      const result = await stockService.getStockHistory(itemId, page, limit);

      // Assert
      expect(mockStockRepository.findStockHistory).toHaveBeenCalledWith(
        itemId,
        page,
        limit,
      );
      expect(result).toEqual(history);
      expect(result.data).toHaveLength(2);
    });
  });

  describe("updateInventoryType", () => {
    it("should convert TRACKED to UNLIMITED and clear stock data", async () => {
      // Arrange
      const itemId = 1;
      const data: InventoryTypeRequest = {
        inventoryType: InventoryType.UNLIMITED,
      };

      const trackedItem = createTrackedMenuItemFixture({
        id: itemId,
        inventoryType: InventoryType.TRACKED,
        stockQuantity: 50,
      });

      mockStockRepository.findByIdForUpdate.mockResolvedValue(trackedItem);

      const updatedItem = createUnlimitedMenuItemFixture({
        id: itemId,
        inventoryType: InventoryType.UNLIMITED,
        stockQuantity: null,
        initialStock: null,
        lowStockAlert: null,
      });

      mockStockRepository.updateStock.mockResolvedValue(updatedItem);

      // Act
      const result = await stockService.updateInventoryType(itemId, data);

      // Assert
      expect(mockStockRepository.updateStock).toHaveBeenCalledWith(
        expect.anything(),
        itemId,
        {
          inventoryType: InventoryType.UNLIMITED,
          stockQuantity: null,
          initialStock: null,
          lowStockAlert: null,
        },
      );
      expect(result).toEqual(updatedItem);
    });

    it("should convert UNLIMITED to TRACKED with defaults", async () => {
      // Arrange
      const itemId = 1;
      const data: InventoryTypeRequest = {
        inventoryType: InventoryType.TRACKED,
        lowStockAlert: 10,
      };

      const unlimitedItem = createUnlimitedMenuItemFixture({
        id: itemId,
        inventoryType: InventoryType.UNLIMITED,
      });

      mockStockRepository.findByIdForUpdate.mockResolvedValue(unlimitedItem);

      const updatedItem = createTrackedMenuItemFixture({
        id: itemId,
        inventoryType: InventoryType.TRACKED,
        stockQuantity: 0,
        initialStock: 0,
        lowStockAlert: 10,
        autoMarkUnavailable: true,
      });

      mockStockRepository.updateStock.mockResolvedValue(updatedItem);

      // Act
      const result = await stockService.updateInventoryType(itemId, data);

      // Assert
      expect(mockStockRepository.updateStock).toHaveBeenCalledWith(
        expect.anything(),
        itemId,
        {
          inventoryType: InventoryType.TRACKED,
          stockQuantity: 0,
          initialStock: 0,
          lowStockAlert: 10,
          autoMarkUnavailable: true,
        },
      );
      expect(result).toEqual(updatedItem);
    });

    it("should throw error when menu item not found", async () => {
      // Arrange
      const itemId = 999;
      const data: InventoryTypeRequest = {
        inventoryType: InventoryType.TRACKED,
      };

      mockStockRepository.findByIdForUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(
        stockService.updateInventoryType(itemId, data),
      ).rejects.toThrow("Menu Item ID 999 not found");
    });
  });
});
