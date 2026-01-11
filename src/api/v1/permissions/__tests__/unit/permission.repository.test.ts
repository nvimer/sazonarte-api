import { Permission } from "@prisma/client";

// Create mock functions
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateMany = jest.fn();
const mockCount = jest.fn();

// Mock Prisma
jest.mock("../../../../../database/prisma", () => ({
  __esModule: true,
  default: {
    permission: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      updateMany: mockUpdateMany,
      count: mockCount,
    },
  },
}));

// Mock pagination helper
jest.mock("../../../../../utils/pagination.helper", () => ({
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

import permissionRepository from "../../permission.repository";

// Helper to create permission fixture
const createPermissionFixture = (
  overrides: Partial<Permission> = {},
): Permission => ({
  id: 1,
  name: "users:read",
  description: "Read user data",
  deleted: false,
  deletedAt: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

describe("PermissionRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated permissions", async () => {
      // Arrange
      const mockPermissions = [
        createPermissionFixture({ id: 1, name: "users:read" }),
        createPermissionFixture({ id: 2, name: "users:write" }),
      ];
      mockFindMany.mockResolvedValue(mockPermissions);
      mockCount.mockResolvedValue(2);

      // Act
      const result = await permissionRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it("should calculate skip correctly for pagination", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(30);

      // Act
      await permissionRepository.findAll({ page: 3, limit: 10 });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it("should filter out deleted permissions", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await permissionRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted: false },
        }),
      );
    });

    it("should order by name ascending", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await permissionRepository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: "asc" },
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return permission when id exists", async () => {
      // Arrange
      const mockPermission = createPermissionFixture({ id: 5 });
      mockFindUnique.mockResolvedValue(mockPermission);

      // Act
      const result = await permissionRepository.findById(5);

      // Assert
      expect(result).toEqual(mockPermission);
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 5 } });
    });

    it("should return null when id does not exist", async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act
      const result = await permissionRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("should return permission when name exists (case insensitive)", async () => {
      // Arrange
      const mockPermission = createPermissionFixture({ name: "users:read" });
      mockFindFirst.mockResolvedValue(mockPermission);

      // Act
      const result = await permissionRepository.findByName("USERS:READ");

      // Assert
      expect(result).toEqual(mockPermission);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: "USERS:READ", mode: "insensitive" },
          deleted: false,
        },
      });
    });

    it("should return null when name does not exist", async () => {
      // Arrange
      mockFindFirst.mockResolvedValue(null);

      // Act
      const result = await permissionRepository.findByName("nonexistent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create permission", async () => {
      // Arrange
      const createData = {
        name: "orders:create",
        description: "Create orders",
      };
      const mockCreatedPermission = createPermissionFixture({
        id: 10,
        ...createData,
      });
      mockCreate.mockResolvedValue(mockCreatedPermission);

      // Act
      const result = await permissionRepository.create(createData);

      // Assert
      expect(result).toEqual(mockCreatedPermission);
      expect(mockCreate).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe("update", () => {
    it("should update permission fields", async () => {
      // Arrange
      const updateData = { description: "Updated description" };
      const mockUpdatedPermission = createPermissionFixture({
        id: 1,
        description: "Updated description",
      });
      mockUpdate.mockResolvedValue(mockUpdatedPermission);

      // Act
      const result = await permissionRepository.update(1, updateData);

      // Assert
      expect(result.description).toBe("Updated description");
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });
  });

  describe("delete", () => {
    it("should soft delete permission", async () => {
      // Arrange
      const mockDeletedPermission = createPermissionFixture({
        id: 1,
        deleted: true,
      });
      mockUpdate.mockResolvedValue(mockDeletedPermission);

      // Act
      const result = await permissionRepository.delete(1);

      // Assert
      expect(result.deleted).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deleted: true },
      });
    });
  });

  describe("bulkDelete", () => {
    it("should soft delete multiple permissions", async () => {
      // Arrange
      mockUpdateMany.mockResolvedValue({ count: 3 });

      // Act
      const result = await permissionRepository.bulkDelete([1, 2, 3]);

      // Assert
      expect(result).toBe(3);
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 3] },
          deleted: false,
        },
        data: { deleted: true },
      });
    });

    it("should return 0 when no permissions found", async () => {
      // Arrange
      mockUpdateMany.mockResolvedValue({ count: 0 });

      // Act
      const result = await permissionRepository.bulkDelete([999]);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("search", () => {
    it("should search permissions by name", async () => {
      // Arrange
      const mockPermissions = [
        createPermissionFixture({ name: "users:read" }),
        createPermissionFixture({ name: "users:write" }),
      ];
      mockFindMany.mockResolvedValue(mockPermissions);
      mockCount.mockResolvedValue(2);

      // Act
      const result = await permissionRepository.search({
        page: 1,
        limit: 10,
        search: "users",
      });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: {
              contains: "users",
              mode: "insensitive",
            },
          }),
        }),
      );
    });

    it("should search without filter when search not provided", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await permissionRepository.search({ page: 1, limit: 10 });

      // Assert
      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.name).toBeUndefined();
    });

    it("should always exclude deleted permissions in search", async () => {
      // Arrange
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      // Act
      await permissionRepository.search({
        page: 1,
        limit: 10,
        search: "test",
      });

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deleted: false,
          }),
        }),
      );
    });
  });
});
