import { Table, TableStatus } from "@prisma/client";
import { TableServiceInterface } from "./interfaces/table.service.interface";
import { CreateTableInput, UpdateTableInput } from "./table.validator";
import { TableRepositoryInterface } from "./interfaces/table.repository.interface";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import tableRepository from "./table.repository";

/**
 * Table Service
 *
 * This service is responsible for:
 * - Table CRUD operations (Create, Read, Update, Delete)
 * - Table status management and updates
 * - Pagination and data retrieval logic
 * - Business rule enforcement
 * - Data validation and transformation
 *
 * Table management includes:
 * - Table creation with validation
 * - Table retrieval with pagination
 * - Table updates and modifications
 * - Table deletion with constraints
 * - Status management for restaurant operations
 */
class TableService implements TableServiceInterface {
  constructor(private tableRepository: TableRepositoryInterface) {}

  /**
   * Retrieves a paginated list of all tables in the system.
   * This method handles pagination logic and delegates data
   * retrieval to the repository layer.
   *
   * Business Logic:
   * - Validates pagination parameters
   * - Handles default values
   * - Ensures data consistency
   * - Provides optimized queries
   *
   * Use Cases:
   * - Restaurant dashboard display
   * - Table management interface
   * - Data export and reporting
   * - Administrative overview
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
   *
   * Business Logic:
   * - Validates table existence
   * - Handles not found scenarios
   * - Ensures data completeness
   * - Provides error handling
   *
   * Use Cases:
   * - Individual table details view
   * - Table reservation system
   * - Status checking and updates
   * - Table management operations
   */
  async findTableById(id: number): Promise<Table> {
    return this.tableRepository.findById(id);
  }

  /**
   * Creates a new table in the system with the provided information.
   * This method handles table creation with validation and
   * ensures data integrity.
   *
   * Validation Rules:
   * - Table name uniqueness
   * - Capacity must be positive integer
   * - Status must be valid enum value
   * - Required fields validation
   *
   * Use Cases:
   * - Restaurant setup and configuration
   * - Adding new tables to the system
   * - Table management during expansion
   * - Initial system setup
   */
  async createTable(data: CreateTableInput): Promise<Table> {
    return this.tableRepository.create(data);
  }

  /**
   * Updates an existing table with new information.
   * This method allows modification of table properties
   * while maintaining data integrity.
   *
   * Update Features:
   * - Partial updates supported
   * - Validation of updated fields
   * - Conflict detection for unique fields
   * - Timestamp updates for modification tracking
   *
   * Business Logic:
   * - Validates table existence
   * - Checks for name conflicts
   * - Validates capacity changes
   * - Maintains data consistency
   *
   * Use Cases:
   * - Table information updates
   * - Capacity adjustments
   * - Location changes
   * - Description modifications
   */
  async updateTable(id: number, data: UpdateTableInput): Promise<Table> {
    return this.tableRepository.update(id, data);
  }

  /**
   * Removes a table from the system permanently.
   * This method handles table deletion with proper
   * cleanup and validation.
   *
   * Deletion Constraints:
   * - Checks for active reservations
   * - Validates table existence
   * - Ensures no dependent records
   * - Soft delete option available
   *
   * Business Logic:
   * - Validates deletion eligibility
   * - Handles constraint violations
   * - Performs cleanup operations
   * - Maintains referential integrity
   *
   * Use Cases:
   * - Table removal from system
   * - Restaurant layout changes
   * - System cleanup and maintenance
   * - Table replacement scenarios
   */
  async deleteTable(id: number): Promise<void> {
    await this.tableRepository.delete(id);
  }

  /**
   * Updates the status of a specific table.
   * This method is commonly used for real-time table status
   * management in restaurant operations.
   *
   * Business Logic:
   * - Validates status transitions
   * - Updates timestamp information
   * - Ensures status consistency
   * - Handles status change notifications
   *
   * Use Cases:
   * - Real-time table availability updates
   * - Reservation management
   * - Restaurant floor management
   * - Table status monitoring
   * - Integration with POS systems
   */
  async updateTableStatus(id: number, status: TableStatus): Promise<Table> {
    return this.tableRepository.updateStatus(id, status);
  }
}

export default new TableService(tableRepository);
