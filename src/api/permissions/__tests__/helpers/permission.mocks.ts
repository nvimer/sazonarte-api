import { PermissionRepositoryInterface } from "../../interfaces/permission.repository.interface";
import { PermissionServiceInterface } from "../../interfaces/permission.service.interface";
import { createPermissionFixture } from "./permission.fixtures";

export function createMockPermissionRepository(): jest.Mocked<PermissionRepositoryInterface> {
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
 * Creates a mocked PermissionService with all methods as jest.fn()
 */
export function createMockPermissionService(): jest.Mocked<PermissionServiceInterface> {
  return {
    findAllPermissions: jest.fn(),
    findPermissionById: jest.fn(),
    createPermission: jest.fn(),
    updatePermission: jest.fn(),
    deletePermission: jest.fn(),
    bulkDeletePermissions: jest.fn(),
    searchPermissions: jest.fn(),
  };
}

/**
 * Pre-configured mock scenarios for common test cases
 */
export const permissionMockScenarios = {
  /**
   * Configures mock with a valid permission
   */
  permissionFound: (mockRepo: jest.Mocked<PermissionRepositoryInterface>) => {
    const permission = createPermissionFixture();
    mockRepo.findById.mockResolvedValue(permission);
    mockRepo.findByName.mockResolvedValue(permission);
  },

  /**
   * Configures mock to simulate permission not found
   */
  permissionNotFound: (
    mockRepo: jest.Mocked<PermissionRepositoryInterface>,
  ) => {
    mockRepo.findById.mockResolvedValue(null);
    mockRepo.findByName.mockResolvedValue(null);
  },

  /**
   * Configures mock to simulate name conflict
   */
  nameConflict: (mockRepo: jest.Mocked<PermissionRepositoryInterface>) => {
    const existingPermission = createPermissionFixture({
      name: "existing:permission",
    });
    mockRepo.findByName.mockResolvedValue(existingPermission);
  },

  /**
   * Configures mock to simulate database error
   */
  databaseError: (mockRepo: jest.Mocked<PermissionRepositoryInterface>) => {
    const error = new Error("Database connection failed");
    mockRepo.findById.mockRejectedValue(error);
    mockRepo.findAll.mockRejectedValue(error);
    mockRepo.create.mockRejectedValue(error);
  },
};
