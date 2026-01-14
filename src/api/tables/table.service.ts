import { Table, TableStatus } from "@prisma/client";
import { TableServiceInterface } from "./interfaces/table.service.interface";
import { CreateTableInput, UpdateTableInput } from "./table.validator";
import { TableRepositoryInterface } from "./interfaces/table.repository.interface";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../interfaces/pagination.interfaces";
import tableRepository from "./table.repository";

/**
 * Table Service
 */
export class TableService implements TableServiceInterface {
  constructor(private tableRepository: TableRepositoryInterface) {}

  /**
   * Retrieves a paginated list of all tables in the system.
   * This method handles pagination logic and delegates data
   * retrieval to the repository layer.
   */
  async findAllTables(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Table>> {
    return this.tableRepository.findAll(params);
  }

  /**
   * Retrieves detailed information about a specific table by its ID.
   * This method provides complete table information for individual
   * table management and display.
   */
  async findTableById(id: number): Promise<Table> {
    return this.tableRepository.findById(id);
  }

  /**
   * Creates a new table in the system with the provided information.
   * This method handles table creation with validation and
   * ensures data integrity.
   */
  async createTable(data: CreateTableInput): Promise<Table> {
    return this.tableRepository.create(data);
  }

  /**
   * Updates an existing table with new information.
   * This method allows modification of table properties
   * while maintaining data integrity.
   */
  async updateTable(id: number, data: UpdateTableInput): Promise<Table> {
    return this.tableRepository.update(id, data);
  }

  /**
   * Removes a table from the system permanently.
   * This method handles table deletion with proper
   * cleanup and validation.
   */
  async deleteTable(id: number): Promise<void> {
    await this.tableRepository.delete(id);
  }

  /**
   * Updates the status of a specific table.
   * This method is commonly used for real-time table status
   * management in restaurant operations.
   */
  async updateTableStatus(id: number, status: TableStatus): Promise<Table> {
    return this.tableRepository.updateStatus(id, status);
  }
}

export default new TableService(tableRepository);
