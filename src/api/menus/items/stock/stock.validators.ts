import {
  DailyStockResetRequest,
  AddStockRequest,
  RemoveStockRequest,
  InventoryTypeRequest,
  PaginationParams,
} from "./stock.types";

export const stockValidators = {
  validateDailyReset(data: DailyStockResetRequest) {
    if (!data.items || data.items.length === 0) {
      throw new Error("At least one item must be provided");
    }

    for (const item of data.items) {
      if (item.quantity < 0) {
        throw new Error("Quantity must be 0 or greater");
      }
      if (item.lowStockAlert !== undefined && item.lowStockAlert < 1) {
        throw new Error("Low stock alert must be at least 1");
      }
    }
  },

  validateAddStock(data: AddStockRequest) {
    if (data.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    if (!data.reason || data.reason.length < 3) {
      throw new Error("Reason must be at least 3 characters");
    }
  },

  validateRemoveStock(data: RemoveStockRequest) {
    if (data.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    if (!data.reason || data.reason.length < 3) {
      throw new Error("Reason must be at least 3 characters");
    }
  },

  validateInventoryType(data: InventoryTypeRequest) {
    if (!["TRACKED", "UNLIMITED"].includes(data.inventoryType)) {
      throw new Error("Invalid enum value. Expected 'TRACKED' | 'UNLIMITED'");
    }

    if (
      data.inventoryType === "TRACKED" &&
      data.lowStockAlert !== undefined &&
      data.lowStockAlert < 1
    ) {
      throw new Error("Low stock alert must be at least 1 for TRACKED items");
    }
  },

  validatePagination(params: PaginationParams) {
    if (params.page < 1) {
      throw new Error("Page must be positive");
    }
    if (params.limit > 100) {
      throw new Error("Limit cannot exceed 100");
    }
  },
};
