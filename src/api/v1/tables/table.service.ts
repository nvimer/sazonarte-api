import { Table, TableStatus } from "@prisma/client";
import { TableServiceInterface } from "./interfaces/table.service.interface";
import { CreateTableInput, UpdateTableInput } from "./table.validator";
import { TableRepositoryInterface } from "./interfaces/table.repository.interface";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import tableRepository from "./table.repository";

class TableService implements TableServiceInterface {
  constructor(private tableRepository: TableRepositoryInterface) {}

  async findAllTables(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Table>> {
    return this.tableRepository.findAll(params);
  }

  async findTableById(id: number): Promise<Table> {
    return this.tableRepository.findById(id);
  }

  async createTable(data: CreateTableInput): Promise<Table> {
    return this.tableRepository.create(data);
  }

  async updateTable(id: number, data: UpdateTableInput): Promise<Table> {
    return this.tableRepository.update(id, data);
  }

  async deleteTable(id: number): Promise<void> {
    await this.tableRepository.delete(id);
  }

  async updateTableStatus(id: number, status: TableStatus): Promise<Table> {
    return this.tableRepository.updateStatus(id, status);
  }
}

export default new TableService(tableRepository);
