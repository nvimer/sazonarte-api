import { TableStatus } from "@prisma/client";

// Create mock functions
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockCount = jest.fn();

// Mock Prisma
jest.mock("../../../../database/prisma", () => ({
  __esModule: true,
  default: {
    table: {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      count: mockCount,
    },
  },
}));

// Mock pagination helper
jest.mock("../../../../utils/pagination.helper", () => ({
  createPaginatedResponse: jest.fn((data, total, params) => ({
    data,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit) || 1,
      hasNextPage: params.page < Math.ceil(total / params.limit),
      hasPreviousPage: params.page > 1,
    },
  })),
}));

import tableRepository from "../../table.repository";
import { createTableFixture } from "../helpers";

describe("TableRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated tables", async () => {
      // Arrange
      const mockTables = [
        createTableFixture({ id: 1, number: "T1" }),
        createTableFixture({ id: 2, number: "T2" }),
      ];
      mockFindMany.mockResolvedValue(mockTables);
      mockCount.mockResolvedValue(2);

      // Act
      const result = await tableRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it("should calculate skip correctly for pagination", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(25);

      // Act
      await tableRepository.findAll({ page: 3, limit: 10 });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it("should filter out deleted tables", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await tableRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted: false },
        }),
      );
    });

    it("should order by table number ascending", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await tableRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { number: "asc" },
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return table when id exists", async () => {
      // Arrange
      const mockTable = createTableFixture({ id: 5 });
      mockFindFirst.mockResolvedValue(mockTable);

      // Act
      const result = await tableRepository.findById(5);

      // Assert
      expect(result).toEqual(mockTable);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { id: 5, deleted: false },
      });
    });

    it("should throw error when table not found", async () => {
      // Arrange
      mockFindFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(tableRepository.findById(999)).rejects.toThrow(
        "Table not found",
      );
    });

    it("should not return deleted tables", async () => {
      // Arrange
      mockFindFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(tableRepository.findById(1)).rejects.toThrow(
        "Table not found",
      );
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
      });
    });
  });

  describe("create", () => {
    it("should create table", async () => {
      // Arrange
      const createData = {
        number: "T10",
        status: TableStatus.AVAILABLE,
        location: "Terraza",
      };
      const mockCreatedTable = createTableFixture({ id: 10, ...createData });
      mockCreate.mockResolvedValue(mockCreatedTable);

      // Act
      const result = await tableRepository.create(createData);

      // Assert
      expect(result).toEqual(mockCreatedTable);
      expect(mockCreate).toHaveBeenCalledWith({ data: createData });
    });

    it("should create table without optional location", async () => {
      // Arrange
      const createData = {
        number: "T11",
      };
      const mockCreatedTable = createTableFixture({ id: 11, number: "T11" });
      mockCreate.mockResolvedValue(mockCreatedTable);

      // Act
      const result = await tableRepository.create(createData);

      // Assert
      expect(result.number).toBe("T11");
    });
  });

  describe("update", () => {
    it("should update table fields", async () => {
      // Arrange
      const updateData = { location: "Patio" };
      const mockUpdatedTable = createTableFixture({ id: 1, location: "Patio" });
      mockUpdate.mockResolvedValue(mockUpdatedTable);

      // Act
      const result = await tableRepository.update(1, updateData);

      // Assert
      expect(result.location).toBe("Patio");
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it("should update table number", async () => {
      // Arrange
      const updateData = { number: "T99" };
      const mockUpdatedTable = createTableFixture({ id: 1, number: "T99" });
      mockUpdate.mockResolvedValue(mockUpdatedTable);

      // Act
      const result = await tableRepository.update(1, updateData);

      // Assert
      expect(result.number).toBe("T99");
    });
  });

  describe("delete", () => {
    it("should soft delete table", async () => {
      // Arrange
      mockUpdate.mockResolvedValue({ id: 1, deleted: true });

      // Act
      await tableRepository.delete(1);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deleted: true, deletedAt: expect.any(Date) },
      });
    });
  });

  describe("updateStatus", () => {
    it("should update table status to OCCUPIED", async () => {
      // Arrange
      const mockUpdatedTable = createTableFixture({
        id: 1,
        status: TableStatus.OCCUPIED,
      });
      mockUpdate.mockResolvedValue(mockUpdatedTable);

      // Act
      const result = await tableRepository.updateStatus(
        1,
        TableStatus.OCCUPIED,
      );

      // Assert
      expect(result.status).toBe(TableStatus.OCCUPIED);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: TableStatus.OCCUPIED },
      });
    });

    it("should update table status to NEEDS_CLEANING", async () => {
      // Arrange
      const mockUpdatedTable = createTableFixture({
        id: 1,
        status: TableStatus.NEEDS_CLEANING,
      });
      mockUpdate.mockResolvedValue(mockUpdatedTable);

      // Act
      const result = await tableRepository.updateStatus(
        1,
        TableStatus.NEEDS_CLEANING,
      );

      // Assert
      expect(result.status).toBe(TableStatus.NEEDS_CLEANING);
    });

    it("should update table status to AVAILABLE", async () => {
      // Arrange
      const mockUpdatedTable = createTableFixture({
        id: 1,
        status: TableStatus.AVAILABLE,
      });
      mockUpdate.mockResolvedValue(mockUpdatedTable);

      // Act
      const result = await tableRepository.updateStatus(
        1,
        TableStatus.AVAILABLE,
      );

      // Assert
      expect(result.status).toBe(TableStatus.AVAILABLE);
    });
  });
});
