import { Table, TableStatus } from "@prisma/client";
import { CreateTableInput, UpdateTableInput } from "../table.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface TableServiceInterface {
  findAllTables(params: PaginationParams): Promise<PaginatedResponse<Table>>;
  findTableById(id: number): Promise<Table>;
  createTable(data: CreateTableInput): Promise<Table>;
  updateTable(id: number, data: UpdateTableInput): Promise<Table>;
  deleteTable(id: number): Promise<void>;
  updateTableStatus(id: number, status: TableStatus): Promise<Table>;
}
