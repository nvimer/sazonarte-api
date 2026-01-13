import { CategoryRepositoryInterface } from "../../interfaces/category.repository.interface";
import { CategoryServiceInterface } from "../../interfaces/category.service.interface";
import { createCategoryFixture } from "./category.fixtures";

export function createMockCategoryRepository(): jest.Mocked<CategoryRepositoryInterface> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn(),
    search: jest.fn(),
  };
}

/**
 * Creates a mocked CategoryService with all methods as jest.fn()
 */
export function createMockCategoryService(): jest.Mocked<CategoryServiceInterface> {
  return {
    findCategories: jest.fn(),
    findCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    bulkDeleteCategories: jest.fn(),
    searchCategories: jest.fn(),
  };
}

/**
 * Pre-configured mock scenarios for common test cases
 */
export const categoryMockScenarios = {
  /**
   * Configures mock with a valid category
   */
  categoryFound: (mockRepo: jest.Mocked<CategoryRepositoryInterface>) => {
    const category = createCategoryFixture();
    mockRepo.findById.mockResolvedValue(category);
    mockRepo.findByName.mockResolvedValue(category);
  },

  /**
   * Configures mock to simulate category not found
   */
  categoryNotFound: (mockRepo: jest.Mocked<CategoryRepositoryInterface>) => {
    mockRepo.findById.mockResolvedValue(null);
    mockRepo.findByName.mockResolvedValue(null);
  },

  /**
   * Configures mock to simulate name conflict
   */
  nameConflict: (mockRepo: jest.Mocked<CategoryRepositoryInterface>) => {
    const existingCategory = createCategoryFixture({ name: "Existing Name" });
    mockRepo.findByName.mockResolvedValue(existingCategory);
  },

  /**
   * Configures mock to simulate database error
   */
  databaseError: (mockRepo: jest.Mocked<CategoryRepositoryInterface>) => {
    const error = new Error("Database connection failed");
    mockRepo.findById.mockRejectedValue(error);
    mockRepo.findAll.mockRejectedValue(error);
    mockRepo.create.mockRejectedValue(error);
  },
};
