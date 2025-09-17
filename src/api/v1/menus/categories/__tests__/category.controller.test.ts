import request from "supertest";
import express from "express";
import categoryRoutes from "../category.route";
import { HttpStatus } from "../../../../../utils/httpStatus.enum";
import categoryService from "../category.service";
import { errorHandler } from "../../../../../middlewares/error.middleware";
import { CategoryServiceInterface } from "../interfaces/category.service.interface";
import { CustomError } from "../../../../../types/custom-errors";

// Mock the service
jest.mock("../category.service", () => ({
  __esModule: true,
  default: {
    findCategories: jest.fn(),
    findCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    bulkDeleteCategories: jest.fn(),
    searchCategories: jest.fn(),
  },
}));

// Mock auth middleware
jest.mock("../../../../../middlewares/auth.middleware", () => ({
  authJwt: (req: any, _res: any, next: any) => {
    req.user = { id: 1, role: "admin" };
    next();
  },
}));

// Mock role middleware
jest.mock("../../../../../middlewares/role.middleware", () => ({
  requireRole: (_roles: string[]) => (_req: any, _res: any, next: any) => {
    next();
  },
}));

describe("Category Controller Integration Tests", () => {
  let app: express.Application;

  const mockCategory = {
    id: 1,
    name: "Main Course",
    description: "Main dishes",
    order: 1,
    active: true,
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1/menus/categories", categoryRoutes);
    app.use((err: any, req: any, res: any, next: any) => {
      errorHandler(err, req, res, next);
    }); // Add error handling middleware
    jest.clearAllMocks();
  });

  describe("GET /api/v1/menus/categories", () => {
    test("returns paginated categories", async () => {
      const mockResponse = {
        data: [mockCategory],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      (categoryService as any).findCategories.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get("/api/v1/menus/categories")
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        success: true,
        message: "Menu Categories fetched successfully",
        data: {
          data: [mockCategory],
          pagination: mockResponse.pagination,
        },
      });

      expect((categoryService as any).findCategories).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    test("handles pagination parameters", async () => {
      const mockResponse = {
        data: [mockCategory],
        pagination: { total: 1, page: 2, limit: 5, totalPages: 1 },
      };

      (categoryService as any).findCategories.mockResolvedValue(mockResponse);

      await request(app)
        .get("/api/v1/menus/categories?page=2&limit=5")
        .expect(HttpStatus.OK);

      expect((categoryService as any).findCategories).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
      });
    });
  });

  describe("GET /api/v1/menus/categories/:id", () => {
    test("returns category by id", async () => {
      (categoryService as any).findCategoryById.mockResolvedValue(mockCategory);

      const response = await request(app)
        .get("/api/v1/menus/categories/1")
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        success: true,
        message: "Menu Category fetched successfully",
        data: mockCategory,
      });

      expect((categoryService as any).findCategoryById).toHaveBeenCalledWith(1);
    });

    test("returns 404 for non-existent category", async () => {
      const error = new CustomError(
        "Menu Category ID 999 not found",
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
      (categoryService as any).findCategoryById.mockRejectedValue(error);

      await request(app)
        .get("/api/v1/menus/categories/999")
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("POST /api/v1/menus/categories", () => {
    test("creates new category", async () => {
      const newCategory = { ...mockCategory, id: 2 };
      (categoryService as any).createCategory.mockResolvedValue(newCategory);

      const categoryData = {
        name: "Desserts",
        description: "Sweet treats",
        order: 2,
      };

      const response = await request(app)
        .post("/api/v1/menus/categories")
        .send(categoryData)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        success: true,
        message: "Menu Category created successfully",
        data: newCategory,
      });

      expect((categoryService as any).createCategory).toHaveBeenCalledWith(
        categoryData,
      );
    });

    test("validates required fields", async () => {
      const invalidData = {
        name: "ab", // too short
        order: -1, // negative
      };

      await request(app)
        .post("/api/v1/menus/categories")
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    test("handles duplicate name error", async () => {
      const error = new CustomError(
        "Category with name 'Main Course' already exists",
        HttpStatus.CONFLICT,
        "DUPLICATE_NAME",
      );
      (categoryService as any).createCategory.mockRejectedValue(error);

      const categoryData = {
        name: "Main Course",
        description: "Main dishes",
        order: 1,
      };

      await request(app)
        .post("/api/v1/menus/categories")
        .send(categoryData)
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe("PATCH /api/v1/menus/categories/:id", () => {
    test("updates existing category", async () => {
      const updatedCategory = { ...mockCategory, name: "Updated Name" };
      (categoryService as any).updateCategory.mockResolvedValue(
        updatedCategory,
      );

      const updateData = { name: "Updated Name" };

      const response = await request(app)
        .patch("/api/v1/menus/categories/1")
        .send(updateData)
        .expect(HttpStatus.ACCEPTED);

      expect(response.body).toEqual({
        success: true,
        message: "Menu Category updated successfully",
        data: updatedCategory,
      });

      expect((categoryService as any).updateCategory).toHaveBeenCalledWith(
        1,
        updateData,
      );
    });

    test("validates update data", async () => {
      const invalidData = { name: "ab" }; // too short

      await request(app)
        .patch("/api/v1/menus/categories/1")
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    test("rejects empty update", async () => {
      await request(app)
        .patch("/api/v1/menus/categories/1")
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("DELETE /api/v1/menus/categories/:id", () => {
    test("soft deletes category", async () => {
      const deletedCategory = { ...mockCategory, deleted: true };
      (categoryService as any).deleteCategory.mockResolvedValue(
        deletedCategory,
      );

      const response = await request(app)
        .delete("/api/v1/menus/categories/1")
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        success: true,
        message: "Menu Category with ID 1 has been deleted successfully",
        data: { id: 1, name: "Main Course" },
      });

      expect((categoryService as any).deleteCategory).toHaveBeenCalledWith(1);
    });

    test("handles already deleted category", async () => {
      const error = new CustomError(
        "Menu Category ID 1 is already deleted",
        HttpStatus.BAD_REQUEST,
        "ALREADY_DELETED",
      );
      (categoryService as any).deleteCategory.mockRejectedValue(error);

      await request(app)
        .delete("/api/v1/menus/categories/1")
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("POST /api/v1/menus/categories/bulk-delete", () => {
    test("bulk deletes categories", async () => {
      // Clear all mocks first
      jest.clearAllMocks();

      // Mock the service to return success
      (categoryService as any).bulkDeleteCategories.mockResolvedValue(3);

      const bulkData = { ids: [1, 2, 3] };

      const response = await request(app)
        .delete("/api/v1/menus/categories/bulk")
        .send(bulkData)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        success: true,
        message: "3 categories have been deleted successfully",
        data: { deletedCount: 3 },
      });

      expect(
        (categoryService as any).bulkDeleteCategories,
      ).toHaveBeenCalledWith(bulkData);
    });

    test("validates bulk delete data", async () => {
      const invalidData = { ids: [] }; // empty array

      await request(app)
        .delete("/api/v1/menus/categories/bulk")
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /api/v1/menus/categories/search", () => {
    test("searches categories with filters", async () => {
      const mockResponse = {
        data: [mockCategory],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      (categoryService as any).searchCategories.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get("/api/v1/menus/categories/search?search=pizza&active=true")
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        success: true,
        message: "Menu Categories search completed successfully",
        data: {
          data: [mockCategory],
          pagination: mockResponse.pagination,
        },
      });

      expect(
        (categoryService as CategoryServiceInterface).searchCategories,
      ).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: "pizza",
        active: true,
      });
    });
  });
});
