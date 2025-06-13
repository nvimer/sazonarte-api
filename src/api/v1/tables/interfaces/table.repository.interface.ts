import { Table, TableStatus } from "@prisma/client";
import { CreateTableInput, UpdateTableInput } from "../table.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";

export interface TableRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<Table>>;
  findById(id: number): Promise<Table>;
  create(data: CreateTableInput): Promise<Table>;
  update(id: number, data: UpdateTableInput): Promise<Table>;
  delete(id: number): Promise<void>;
  updateStatus(id: number, status: TableStatus): Promise<Table>;
}
