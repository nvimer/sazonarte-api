import { Table, TableStatus } from "@prisma/client";
import { CreateTableInput, UpdateTableInput } from "../table.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

/**
 * Table Service Interface
 *
 * Defines the contract for table service implementations.
 * This interface ensures consistency across different table service
 * implementations and provides clear documentation of expected methods.
 *
 * Business Operations:
 * - Table lifecycle management
 * - Status tracking and updates
 * - Data validation and transformation
 * - Pagination and filtering
 */
export interface TableServiceInterface {
  findAllTables(params: PaginationParams): Promise<PaginatedResponse<Table>>;
  findTableById(id: number): Promise<Table>;
  createTable(data: CreateTableInput): Promise<Table>;
  updateTable(id: number, data: UpdateTableInput): Promise<Table>;
  deleteTable(id: number): Promise<void>;
  updateTableStatus(id: number, status: TableStatus): Promise<Table>;
}
