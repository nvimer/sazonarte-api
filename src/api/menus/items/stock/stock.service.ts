import { MenuItem } from "@prisma/client";
import {
  DailyStockResetRequest,
  AddStockRequest,
  RemoveStockRequest,
  InventoryTypeRequest,
} from "./stock.types";
import { stockValidators } from "./stock.validators";
import { StockRepository } from "./stock.repository";
import prisma from "../../../../database/prisma";
import { PrismaTransaction } from "../../../../types/prisma-transaction.types";

export class StockService {
  constructor(private stockRepository: StockRepository) {}

  async dailyStockReset(data: DailyStockResetRequest, userId: string) {
    // Validation
    stockValidators.validateDailyReset(data);

    return await prisma.$transaction(async (tx: PrismaTransaction) => {
      const results = [];

      for (const item of data.items) {
        const menuItem = await this.stockRepository.findByIdForUpdate(
          tx,
          item.itemId,
        );

        if (!menuItem) {
          throw new Error(`Menu Item ID ${item.itemId} not found`);
        }

        if (menuItem.inventoryType !== "TRACKED") {
          throw new Error("Only TRACKED items can have stock reset");
        }

        const previousStock = menuItem.stockQuantity || 0;
        const newStock = item.quantity;

        // Update menu item
        await this.stockRepository.updateStock(tx, item.itemId, {
          stockQuantity: newStock,
          initialStock: newStock,
          lowStockAlert: item.lowStockAlert || 5,
          isAvailable: true,
        });

        // Create stock adjustment record
        await this.stockRepository.createStockAdjustment(tx, {
          menuItemId: item.itemId,
          adjustmentType: "DAILY_RESET",
          previousStock,
          newStock,
          quantity: newStock,
          reason: "Begin of the day",
          userId,
        });

        results.push({
          itemId: item.itemId,
          previousStock,
          newStock,
        });
      }

      return results;
    });
  }

  async addStock(itemId: number, data: AddStockRequest, userId: string) {
    stockValidators.validateAddStock(data);

    return await prisma.$transaction(async (tx: PrismaTransaction) => {
      const menuItem = await this.stockRepository.findByIdForUpdate(tx, itemId);

      if (!menuItem) {
        throw new Error(`Menu Item ID ${itemId} not found`);
      }

      if (menuItem.inventoryType !== "TRACKED") {
        throw new Error("Cannot add stock to UNLIMITED items");
      }

      const previousStock = menuItem.stockQuantity || 0;
      const newStock = previousStock + data.quantity;

      // Update menu item
      const updatedItem = await this.stockRepository.updateStock(tx, itemId, {
        stockQuantity: newStock,
        isAvailable: true,
      });

      // Create stock adjustment record
      await this.stockRepository.createStockAdjustment(tx, {
        menuItemId: itemId,
        adjustmentType: "MANUAL_ADD",
        previousStock,
        newStock,
        quantity: data.quantity,
        reason: data.reason,
        userId,
      });

      return updatedItem;
    });
  }

  async removeStock(itemId: number, data: RemoveStockRequest, userId: string) {
    stockValidators.validateRemoveStock(data);

    return await prisma.$transaction(async (tx: PrismaTransaction) => {
      const menuItem = await this.stockRepository.findByIdForUpdate(tx, itemId);

      if (!menuItem) {
        throw new Error(`Menu Item ID ${itemId} not found`);
      }

      if (menuItem.inventoryType !== "TRACKED") {
        throw new Error("Cannot remove stock from UNLIMITED items");
      }

      const currentStock = menuItem.stockQuantity || 0;

      if (currentStock < data.quantity) {
        throw new Error("Insufficient stock to remove");
      }

      const previousStock = currentStock;
      const newStock = currentStock - data.quantity;

      // Update menu item
      const updatedItem = await this.stockRepository.updateStock(tx, itemId, {
        stockQuantity: newStock,
        isAvailable: newStock > 0 ? menuItem.isAvailable : false,
      });

      // Create stock adjustment record
      await this.stockRepository.createStockAdjustment(tx, {
        menuItemId: itemId,
        adjustmentType: "MANUAL_REMOVE",
        previousStock,
        newStock,
        quantity: data.quantity,
        reason: data.reason,
        userId,
      });

      return updatedItem;
    });
  }

  async getLowStockItems() {
    return await this.stockRepository.findLowStockItems();
  }

  async getOutOfStockItems() {
    return await this.stockRepository.findOutOfStockItems();
  }

  async getStockHistory(itemId: number, page: number = 1, limit: number = 20) {
    stockValidators.validatePagination({ page, limit });

    return await this.stockRepository.findStockHistory(itemId, page, limit);
  }

  async updateInventoryType(itemId: number, data: InventoryTypeRequest) {
    stockValidators.validateInventoryType(data);

    return await prisma.$transaction(async (tx: PrismaTransaction) => {
      const menuItem = await this.stockRepository.findByIdForUpdate(tx, itemId);

      if (!menuItem) {
        throw new Error(`Menu Item ID ${itemId} not found`);
      }

      const previousType = menuItem.inventoryType;
      const newType = data.inventoryType;

      let updateData: Partial<MenuItem> = {
        inventoryType: newType,
      };

      // Handle type conversion
      if (previousType === "TRACKED" && newType === "UNLIMITED") {
        // Clear stock data when converting to UNLIMITED
        updateData.stockQuantity = null;
        updateData.initialStock = null;
        updateData.lowStockAlert = null;
      } else if (previousType === "UNLIMITED" && newType === "TRACKED") {
        // Set defaults for new TRACKED items
        updateData.stockQuantity = 0;
        updateData.initialStock = 0;
        updateData.lowStockAlert = data.lowStockAlert || 5;
        updateData.autoMarkUnavailable = true;
      } else if (newType === "TRACKED") {
        updateData.lowStockAlert = data.lowStockAlert || menuItem.lowStockAlert;
      }

      return await this.stockRepository.updateStock(tx, itemId, updateData);
    });
  }
}
