import { Prisma } from "@prisma/client";
import { InventoryType } from "../../../../../types/prisma.types";

export const createBaseMenuItem = (overrides: Partial<any> = {}) => ({
  id: 1,
  name: "Hamburguesa Clásica",
  description: "Hamburguesa con carne, lechuga y tomate",
  price: new Prisma.Decimal("14000"),
  isExtra: false,
  isAvailable: true,
  categoryId: 1,
  inventoryType: InventoryType.TRACKED,
  stockQuantity: 50,
  initialStock: 100,
  lowStockAlert: 5,
  autoMarkUnavailable: true,
  imageUrl: null,
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  deleted: false,
  deletedAt: null,
  ...overrides,
});

export const createTrackedMenuItem = () =>
  createBaseMenuItem({
    InventoryType: InventoryType.TRACKED,
    stockQuantity: 50,
  });

export const createUnlimitedMenuItem = () =>
  createBaseMenuItem({
    inventoryTypeSchema: InventoryType.UNLIMITED,
    stockQuantity: null,
  });

export const createUnavailableMenuItem = () =>
  createBaseMenuItem({
    inventoryType: InventoryType.TRACKED,
    stockQuantity: 0,
  });
