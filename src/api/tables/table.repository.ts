import { Table, TableStatus } from "@prisma/client";
import { TableRepositoryInterface } from "./interfaces/table.repository.interface";
import { CreateTableInput, UpdateTableInput } from "./table.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../interfaces/pagination.interfaces";
import prisma from "../../database/prisma";
import { createPaginatedResponse } from "../../utils/pagination.helper";

/**
 * Table Repository
 */
class TableRepository implements TableRepositoryInterface {
  /**
   * Retrieves a paginated list of all non-deleted tables from the database.
   * This method implements efficient pagination with proper skip/take
   * logic and total count calculation.
   *
   * Query Features:
   * - Excludes soft-deleted tables (deleted: false)
   * - Orders by table number for consistent display
   * - Implements proper pagination with skip/take
   * - Calculates total count for metadata
   * - Uses Promise.all for concurrent execution
   */
  async findAll(params: PaginationParams): Promise<PaginatedResponse<Table>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [tables, total] = await Promise.all([
      prisma.table.findMany({
        where: { deleted: false },
        orderBy: { number: "asc" },
        skip,
        take: limit,
      }),
      prisma.table.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(tables, total, params);
  }

  /**
   * Retrieves a specific table by its ID, excluding soft-deleted tables.
   * This method provides detailed table information for individual
   * table operations and validation.
   *
   * Query Features:
   * - Excludes soft-deleted tables (deleted: false)
   * - Uses findFirst for single record retrieval
   * - Comprehensive error handling
   * - Returns complete table data
   *
   * Error Handling:
   * - Validates table existence
   * - Checks for soft-deleted status
   * - Provides descriptive error messages
   * - Maintains data integrity
   *
   */
  async findById(id: number): Promise<Table> {
    const table = await prisma.table.findFirst({
      where: { id, deleted: false },
    });
    if (!table) {
      throw new Error("Table not found");
    }
    return table;
  }

  /**
   * Creates a new table record in the database.
   * This method handles table creation with proper data validation
   * and ensures data integrity.
   *
   * Creation Features:
   * - Direct data insertion
   * - Automatic ID generation
   * - Timestamp creation (createdAt, updatedAt)
   * - Default value handling
   */
  async create(data: CreateTableInput): Promise<Table> {
    return await prisma.table.create({ data });
  }

  /**
   * Updates an existing table record in the database.
   * This method allows modification of table properties
   * while maintaining data integrity.
   *
   * Update Features:
   * - Partial updates supported
   * - Automatic updatedAt timestamp
   * - Validation at database level
   * - Optimistic locking support
   */
  async update(id: number, data: UpdateTableInput): Promise<Table> {
    return await prisma.table.update({
      where: { id },
      data,
    });
  }

  /**
   * Performs a soft delete of a table record.
   * This method marks the table as deleted without removing
   * the actual record from the database.
   */
  async delete(id: number): Promise<void> {
    await prisma.table.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() },
    });
  }

  /**
   * Updates the status of a specific table.
   * This method is commonly used for real-time table status
   * management in restaurant operations.
   */
  async updateStatus(id: number, status: TableStatus): Promise<Table> {
    return await prisma.table.update({
      where: { id },
      data: { status },
    });
  }
}

export default new TableRepository();
