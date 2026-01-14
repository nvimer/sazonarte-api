import { PrismaClient } from "@prisma/client";
import { StockRepository } from "../../stock.repository";

/**
 * Creates a mocked StockRepository
 */
export function createMockStockRepository(): jest.Mocked<StockRepository> {
  return {
    findByIdForUpdate: jest.fn(),
    updateStock: jest.fn(),
    createStockAdjustment: jest.fn(),
    findLowStockItems: jest.fn(),
    findOutOfStockItems: jest.fn(),
    findStockHistory: jest.fn(),
  } as unknown as jest.Mocked<StockRepository>;
}

/**
 * Creates a mocked PrismaClient with transaction support
 */
export function createMockPrismaClient(): jest.Mocked<PrismaClient> {
  const mockTransaction = jest.fn();
  return {
    $transaction: mockTransaction,
  } as unknown as jest.Mocked<PrismaClient>;
}
