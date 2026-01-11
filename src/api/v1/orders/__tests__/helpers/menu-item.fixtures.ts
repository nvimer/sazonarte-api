import { Prisma } from "@prisma/client";
import { InventoryType } from "../../../../../types/prisma.types";

/**
 * Base menu item fixture
 */
export function createMenuItemFixture(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: 1,
    categoryId: 1,
    name: "Hamburguesa Clásica",
    description: "Hamburguesa con carne, lechuga y tomate",
    price: new Prisma.Decimal("14000"),
    isExtra: false,
    isAvailable: true,
    imageUrl: null,
    inventoryType: InventoryType.TRACKED,
    stockQuantity: 50,
    initialStock: 100,
    lowStockAlert: 5,
    autoMarkUnavailable: true,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    deleted: false,
    deletedAt: null,
    ...overrides,
  };
}

/**
 * Creates a TRACKED inventory menu item
 */
export function createTrackedMenuItemFixture(
  stockQuantity = 50,
  overrides: Partial<Record<string, unknown>> = {},
) {
  return createMenuItemFixture({
    inventoryType: InventoryType.TRACKED,
    stockQuantity,
    initialStock: stockQuantity,
    ...overrides,
  });
}

/**
 * Creates an UNLIMITED inventory menu item
 */
export function createUnlimitedMenuItemFixture(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return createMenuItemFixture({
    inventoryType: InventoryType.UNLIMITED,
    stockQuantity: null,
    initialStock: null,
    ...overrides,
  });
}

/**
 * Creates an out-of-stock menu item
 */
export function createOutOfStockMenuItemFixture(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return createMenuItemFixture({
    inventoryType: InventoryType.TRACKED,
    stockQuantity: 0,
    isAvailable: false,
    ...overrides,
  });
}

/**
 * Creates an unavailable menu item (not out of stock, just disabled)
 */
export function createUnavailableMenuItemFixture(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return createMenuItemFixture({
    isAvailable: false,
    stockQuantity: 50,
    ...overrides,
  });
}

/**
 * Creates a low stock menu item (triggers alert)
 */
export function createLowStockMenuItemFixture(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return createMenuItemFixture({
    inventoryType: InventoryType.TRACKED,
    stockQuantity: 3,
    lowStockAlert: 5,
    ...overrides,
  });
}

/**
 * Creates an extra item fixture (e.g., extra cheese)
 */
export function createExtraMenuItemFixture(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return createMenuItemFixture({
    id: 100,
    name: "Queso Extra",
    description: "Porción adicional de queso",
    price: new Prisma.Decimal("3000"),
    isExtra: true,
    inventoryType: InventoryType.UNLIMITED,
    stockQuantity: null,
    ...overrides,
  });
}

/**
 * Creates a beverage item fixture (typically unlimited)
 */
export function createBeverageMenuItemFixture(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return createMenuItemFixture({
    id: 200,
    categoryId: 5, // Assume beverages category
    name: "Coca-Cola",
    description: "Bebida gaseosa 350ml",
    price: new Prisma.Decimal("3500"),
    inventoryType: InventoryType.UNLIMITED,
    stockQuantity: null,
    initialStock: null,
    ...overrides,
  });
}
