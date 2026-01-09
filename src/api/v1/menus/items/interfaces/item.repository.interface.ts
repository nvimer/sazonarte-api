import { MenuItem, StockAdjustment } from "@prisma/client";
import {
  CreateItemInput,
  DailyStockResetInput,
  MenuItemSearchParams,
} from "../item.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../../interfaces/pagination.interfaces";

/**
 * Menu Item Repository Interface
 *
 * Defines the contract for menu item repository implementations.
 * This interface ensures consistency across different menu item repository
 * implementations and provides clear documentation of expected methods.
 */
export interface ItemRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<MenuItem>>;
  findById(id: number): Promise<MenuItem | null>;
  create(data: CreateItemInput): Promise<MenuItem>;

  search(
    params: PaginationParams & MenuItemSearchParams,
  ): Promise<PaginatedResponse<MenuItem>>;
  updateStock(
    id: number,
    quantity: number,
    adjustmentType: string,
    reason?: string,
    userId?: string,
    orderId?: string,
  ): Promise<MenuItem>;
  dailyStockReset(items: DailyStockResetInput): Promise<void>;
  getLowStock(): Promise<MenuItem[]>;
  getOutOfStock(): Promise<MenuItem[]>;
  getStockHistory(
    itemId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<StockAdjustment>>;
  setInventoryType(
    id: number,
    inventoryType: string,
    lowStockAlert?: number,
  ): Promise<MenuItem>;
}
