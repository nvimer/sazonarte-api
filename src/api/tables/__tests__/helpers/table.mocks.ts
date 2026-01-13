import { TableRepositoryInterface } from "../../interfaces/table.repository.interface";
import { TableServiceInterface } from "../../interfaces/table.service.interface";
import { createTableFixture } from "./table.fixtures";

/**
 * Creates a mocked TableRepository with all methods as jest.fn()
 */
export function createMockTableRepository(): jest.Mocked<TableRepositoryInterface> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStatus: jest.fn(),
  };
}

/**
 * Creates a mocked TableService with all methods as jest.fn()
 */
export function createMockTableService(): jest.Mocked<TableServiceInterface> {
  return {
    findAllTables: jest.fn(),
    findTableById: jest.fn(),
    createTable: jest.fn(),
    updateTable: jest.fn(),
    deleteTable: jest.fn(),
    updateTableStatus: jest.fn(),
  };
}

/**
 * Pre-configured mock scenarios for common test cases
 */
export const tableMockScenarios = {
  /**
   * Configures mock with a valid table
   */
  tableFound: (mockRepo: jest.Mocked<TableRepositoryInterface>) => {
    const table = createTableFixture();
    mockRepo.findById.mockResolvedValue(table);
  },

  /**
   * Configures mock to simulate table not found
   */
  tableNotFound: (mockRepo: jest.Mocked<TableRepositoryInterface>) => {
    mockRepo.findById.mockRejectedValue(new Error("Table not found"));
  },

  /**
   * Configures mock to simulate table occupied
   */
  tableOccupied: (mockRepo: jest.Mocked<TableRepositoryInterface>) => {
    const table = createTableFixture({ status: "OCCUPIED" });
    mockRepo.findById.mockResolvedValue(table);
  },

  /**
   * Configures mock to simulate database error
   */
  databaseError: (mockRepo: jest.Mocked<TableRepositoryInterface>) => {
    const error = new Error("Database connection failed");
    mockRepo.findById.mockRejectedValue(error);
    mockRepo.findAll.mockRejectedValue(error);
    mockRepo.create.mockRejectedValue(error);
  },
};
