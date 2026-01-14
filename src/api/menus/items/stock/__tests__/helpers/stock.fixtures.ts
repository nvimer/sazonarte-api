import { MenuItem, StockAdjustment, Prisma } from "@prisma/client";
import { InventoryType } from "../../../../../../types/prisma.types";

/**
 * Creates a stock adjustment fixture
 */
export function createStockAdjustmentFixture(
  overrides: Partial<StockAdjustment> = {},
): StockAdjustment {
  return {
    id: "adjustment-1",
    menuItemId: 1,
    adjustmentType: "MANUAL_ADD",
    previousStock: 50,
    newStock: 60,
    quantity: 10,
    reason: "Manual stock addition",
    userId: "user-123",
    orderId: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

/**
 * Creates a tracked menu item fixture for stock operations
 */
export function createTrackedMenuItemFixture(
  overrides: Partial<MenuItem> = {},
): MenuItem {
  return {
    id: 1,
    categoryId: 1,
    name: "Test Item",
    description: "Test description",
    price: new Prisma.Decimal("10000"),
    isExtra: false,
    isAvailable: true,
    imageUrl: null,
    inventoryType: InventoryType.TRACKED,
    stockQuantity: 50,
    initialStock: 100,
    lowStockAlert: 5,
    autoMarkUnavailable: true,
    deleted: false,
    deletedAt: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

/**
 * Creates an unlimited inventory menu item fixture
 */
export function createUnlimitedMenuItemFixture(
  overrides: Partial<MenuItem> = {},
): MenuItem {
  return {
    id: 1,
    categoryId: 1,
    name: "Test Item",
    description: "Test description",
    price: new Prisma.Decimal("10000"),
    isExtra: false,
    isAvailable: true,
    imageUrl: null,
    inventoryType: InventoryType.UNLIMITED,
    stockQuantity: null,
    initialStock: null,
    lowStockAlert: null,
    autoMarkUnavailable: false,
    deleted: false,
    deletedAt: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
