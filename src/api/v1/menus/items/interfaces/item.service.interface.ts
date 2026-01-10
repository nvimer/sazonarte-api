import { MenuItem, StockAdjustment } from "@prisma/client";
import {
  AddStockBodyInput,
  CreateItemInput,
  DailyStockResetInput,
  InventoryTypeInput,
  MenuItemSearchParams,
  RemoveStockBodyInput,
  StockHistoryParams,
} from "../item.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../../interfaces/pagination.interfaces";

/**
 * Menu Item Service Interface
 *
 * Defines the contract for menu item service implementations.
 * This interface ensures consistency across different menu item service
 * implementations and provides clear documentation of expected methods.
 */
export interface ItemServiceInterface {
  findAllMenuItems(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuItem>>;
  findMenuItemById(id: number): Promise<MenuItem>;
  createItem(data: CreateItemInput): Promise<MenuItem>;

  searchMenuItems(
    params: PaginationParams & MenuItemSearchParams,
  ): Promise<PaginatedResponse<MenuItem>>;
  dailyStockReset(data: DailyStockResetInput): Promise<void>;
  addStock(
    id: number,
    data: AddStockBodyInput,
    userId?: string,
  ): Promise<MenuItem>;
  removeStock(
    id: number,
    data: RemoveStockBodyInput,
    userId?: string,
  ): Promise<MenuItem>;
  deductStockForOrder(
    itemId: number,
    quantity: number,
    orderId: string,
  ): Promise<void>;
  revertStockForOrder(
    itemId: number,
    quantity: number,
    orderId: string,
  ): Promise<void>;
  getLowStock(): Promise<MenuItem[]>;
  getOutStock(): Promise<MenuItem[]>;
  getStockHistory(
    id: number,
    params: StockHistoryParams,
  ): Promise<PaginatedResponse<StockAdjustment>>;
  setInventoryType(id: number, data: InventoryTypeInput): Promise<MenuItem>;
}
