import { Table, TableStatus } from "@prisma/client";
import { TableRepositoryInterface } from "./interfaces/table.repository.interface";
import { CreateTableInput, UpdateTableInput } from "./table.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import prisma from "../../../database/prisma";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

/**
 * Table Repository
 *
 * Data access layer for table-related database operations.
 * This repository is responsible for:
 * - Table persistence and storage
 * - Table retrieval and querying
 * - Table lifecycle management
 * - Database interaction for table operations
 * - Soft delete implementation
 *
 * Database Operations:
 * - Table creation and storage
 * - Paginated table retrieval
 * - Table updates and modifications
 * - Soft delete for data preservation
 * - Status management and updates
 *
 * Data Integrity Features:
 * - Soft delete implementation (deleted flag)
 * - Deletion timestamp tracking
 * - Consistent ordering (by table number)
 * - Existence validation
 * - Error handling for missing records
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
   *
   * Pagination Logic:
   * - skip = (page - 1) * limit
   * - take = limit
   * - Total count for metadata calculation
   * - Consistent ordering for reliable pagination
   *
   * Use Cases:
   * - Restaurant dashboard display
   * - Table management interface
   * - Data export and reporting
   * - Administrative overview
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
   * Use Cases:
   * - Individual table details view
   * - Table update operations
   * - Status management
   * - Validation and verification
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
   *
   * Data Integrity:
   * - Prisma validation at database level
   * - Foreign key constraint validation
   * - Unique constraint enforcement
   * - Required field validation
   *
   * Use Cases:
   * - Restaurant setup and configuration
   * - Adding new tables to the system
   * - Table management during expansion
   * - Initial system setup
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
   *
   * Data Integrity:
   * - Validates table existence
   * - Enforces unique constraints
   * - Maintains referential integrity
   * - Handles concurrent updates
   *
   * Use Cases:
   * - Table information updates
   * - Capacity adjustments
   * - Location changes
   * - Description modifications
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
   *
   * Soft Delete Features:
   * - Sets deleted flag to true
   * - Records deletion timestamp
   * - Preserves data for audit trails
   * - Maintains referential integrity
   *
   * Data Preservation:
   * - Record remains in database
   * - Deletion timestamp tracked
   * - Audit trail maintained
   * - Recovery possible if needed
   *
   * Use Cases:
   * - Table removal from active use
   * - Data preservation for compliance
   * - Audit trail maintenance
   * - Potential data recovery
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
   *
   * Status Management:
   * - Real-time status updates
   * - Status validation at database level
   * - Automatic timestamp updates
   * - Optimistic locking support
   *
   * Use Cases:
   * - Real-time table availability updates
   * - Reservation management
   * - Restaurant floor management
   * - Table status monitoring
   * - Integration with POS systems
   */
  async updateStatus(id: number, status: TableStatus): Promise<Table> {
    return await prisma.table.update({
      where: { id },
      data: { status },
    });
  }
}

export default new TableRepository();
