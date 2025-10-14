import CategoryRepository from "../category.repository";
import { PaginationParams } from "../../../../../interfaces/pagination.interfaces";
import prisma from "../../../../../database/prisma";

// Mock the prisma instance
jest.mock("../../../../../database/prisma", () => ({
  __esModule: true,
  default: {
    menuCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("Category Repository", () => {
  const mockCategory = {
    id: 1,
    name: "Main Course",
    description: "Main dishes",
    order: 1,
    active: true,
    deleted: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    test("returns paginated categories", async () => {
      const mockCategories = [mockCategory];
      const mockCount = 1;

      (prisma.menuCategory as any).findMany.mockResolvedValue(mockCategories);
      (prisma.menuCategory as any).count.mockResolvedValue(mockCount);

      const params: PaginationParams = { page: 1, limit: 10 };
      const result = await CategoryRepository.findAll(params);

      expect(result).toEqual({
        data: mockCategories,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      expect((prisma.menuCategory as any).findMany).toHaveBeenCalledWith({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip: 0,
        take: 10,
      });

      expect((prisma.menuCategory as any).count).toHaveBeenCalledWith({
        where: { deleted: false },
      });
    });

    test("handles pagination correctly", async () => {
      const mockCategories = [mockCategory];
      const mockCount = 25;

      (prisma.menuCategory as any).findMany.mockResolvedValue(mockCategories);
      (prisma.menuCategory as any).count.mockResolvedValue(mockCount);

      const params: PaginationParams = { page: 3, limit: 10 };
      const result = await CategoryRepository.findAll(params);

      expect(result.meta).toEqual({
        total: 25,
        page: 3,
        limit: 10,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });

      expect((prisma.menuCategory as any).findMany).toHaveBeenCalledWith({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip: 20, // (page - 1) * limit
        take: 10,
      });
    });
  });

  describe("findById", () => {
    test("returns category by id", async () => {
      (prisma.menuCategory as any).findUnique.mockResolvedValue(mockCategory);

      const result = await CategoryRepository.findById(1);

      expect(result).toEqual(mockCategory);
      expect((prisma.menuCategory as any).findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    test("returns null for non-existent category", async () => {
      (prisma.menuCategory as any).findUnique.mockResolvedValue(null);

      const result = await CategoryRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    test("returns category by name", async () => {
      (prisma.menuCategory as any).findFirst.mockResolvedValue(mockCategory);

      const result = await CategoryRepository.findByName("Main Course");

      expect(result).toEqual(mockCategory);
      expect((prisma.menuCategory as any).findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: "Main Course", mode: "insensitive" },
          deleted: false,
        },
      });
    });

    test("returns null for non-existent name", async () => {
      (prisma.menuCategory as any).findFirst.mockResolvedValue(null);

      const result = await CategoryRepository.findByName("Non-existent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    test("creates new category", async () => {
      const newCategoryData = {
        name: "Desserts",
        description: "Sweet treats",
        order: 2,
        active: true,
      };

      const createdCategory = { ...mockCategory, ...newCategoryData, id: 2 };
      (prisma.menuCategory as any).create.mockResolvedValue(createdCategory);

      const result = await CategoryRepository.create(newCategoryData);

      expect(result).toEqual(createdCategory);
      expect((prisma.menuCategory as any).create).toHaveBeenCalledWith({
        data: newCategoryData,
      });
    });
  });

  describe("update", () => {
    test("updates existing category", async () => {
      const updateData = { name: "Updated Name" };
      const updatedCategory = { ...mockCategory, ...updateData };

      (prisma.menuCategory as any).update.mockResolvedValue(updatedCategory);

      const result = await CategoryRepository.update(1, updateData);

      expect(result).toEqual(updatedCategory);
      expect((prisma.menuCategory as any).update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });
  });

  describe("delete", () => {
    test("soft deletes category", async () => {
      const deletedCategory = { ...mockCategory, deleted: true };
      (prisma.menuCategory as any).update.mockResolvedValue(deletedCategory);

      const result = await CategoryRepository.delete(1);

      expect(result).toEqual(deletedCategory);
      expect((prisma.menuCategory as any).update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deleted: true },
      });
    });
  });

  describe("bulkDelete", () => {
    test("bulk soft deletes categories", async () => {
      const mockResult = { count: 3 };
      (prisma.menuCategory as any).updateMany.mockResolvedValue(mockResult);

      const result = await CategoryRepository.bulkDelete([1, 2, 3]);

      expect(result).toBe(3);
      expect((prisma.menuCategory as any).updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] }, deleted: false },
        data: { deleted: true },
      });
    });
  });

  describe("search", () => {
    test("searches categories with name filter", async () => {
      const mockCategories = [mockCategory];
      const mockCount = 1;

      (prisma.menuCategory as any).findMany.mockResolvedValue(mockCategories);
      (prisma.menuCategory as any).count.mockResolvedValue(mockCount);

      const searchParams = {
        page: 1,
        limit: 10,
        search: "pizza",
      };

      const result = await CategoryRepository.search(searchParams);

      expect(result.data).toEqual(mockCategories);
      expect((prisma.menuCategory as any).findMany).toHaveBeenCalledWith({
        where: {
          deleted: false,
          name: { contains: "pizza", mode: "insensitive" },
        },
        orderBy: { name: "asc" },
        skip: 0,
        take: 10,
      });
    });

    test("searches categories with active filter", async () => {
      const mockCategories = [mockCategory];
      const mockCount = 1;

      (prisma.menuCategory as any).findMany.mockResolvedValue(mockCategories);
      (prisma.menuCategory as any).count.mockResolvedValue(mockCount);

      const searchParams = {
        page: 1,
        limit: 10,
        active: true,
      };

      const result = await CategoryRepository.search(searchParams);

      expect(result.data).toEqual(mockCategories);
      expect((prisma.menuCategory as any).findMany).toHaveBeenCalledWith({
        where: {
          deleted: false,
          active: true,
        },
        orderBy: { name: "asc" },
        skip: 0,
        take: 10,
      });
    });

    test("searches categories with combined filters", async () => {
      const mockCategories = [mockCategory];
      const mockCount = 1;

      (prisma.menuCategory as any).findMany.mockResolvedValue(mockCategories);
      (prisma.menuCategory as any).count.mockResolvedValue(mockCount);

      const searchParams = {
        page: 1,
        limit: 10,
        search: "main",
        active: true,
      };

      const result = await CategoryRepository.search(searchParams);

      expect(result.data).toEqual(mockCategories);
      expect((prisma.menuCategory as any).findMany).toHaveBeenCalledWith({
        where: {
          deleted: false,
          name: { contains: "main", mode: "insensitive" },
          active: true,
        },
        orderBy: { name: "asc" },
        skip: 0,
        take: 10,
      });
    });
  });
});
