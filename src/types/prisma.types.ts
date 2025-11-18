import { MenuItem, Prisma, StockAdjustment, User } from "@prisma/client";

export type UserWithProfile = Prisma.UserGetPayload<{
  include: { profile: true };
}>;

// ======== INVENTORY TYPES ===========
/**
 * MenuItem with stock information included
 */
export type MenuItemWithStock = MenuItem & {
  stockAdjustments?: StockAdjustment[];
};

/**
 * Inventory Types
 */
export enum InventoryType {
  TRACKED = "TRACKED", // Stock control
  UNLIMITED = "UNLIMITED", // Without limit
}

/**
 * StockAdjustment Types
 */
export enum StockAdjustmentType {
  DAILY_RESET = "DAILY_RESET", // Begin of the day
  MANUAL_ADD = "MANUAL_ADD", // Admin add stock
  MANUAL_REMOVE = "MANUAL_REMOVE", // Admin rest stock
  ORDER_DEDUCT = "ORDER_DEDUCT", // Order confirmed
  ORDER_CANCELLED = "ORDER_CANCELLED", // Order cancelled
  AUTO_BLOCKED = "AUTO_BLOCKED", // Auto blocked for stock 0
}
