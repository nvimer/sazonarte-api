import { RoleRepositoryInterface } from "../../interfaces/role.repository.interface";
import { RoleServiceInterface } from "../../interfaces/role.service.interface";
import { createRoleFixture } from "./role.fixtures";

/**
 * Creates a mocked RoleRepository with all methods as jest.fn()
 */
export function createMockRoleRepository(): jest.Mocked<RoleRepositoryInterface> {
  return {
    findAll: jest.fn(),
    searchRoles: jest.fn(),
    findById: jest.fn(),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
    bulkDeleteRoles: jest.fn(),
    findRoleWithPermissions: jest.fn(),
    assignPermissionsToRole: jest.fn(),
    removePermissionsFromRole: jest.fn(),
    getRolesWithPermissions: jest.fn(),
  };
}

/**
 * Creates a mocked RoleService with all methods as jest.fn()
 */
export function createMockRoleService(): jest.Mocked<RoleServiceInterface> {
  return {
    findAll: jest.fn(),
    searchRoles: jest.fn(),
    findById: jest.fn(),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
    bulkDeleteRoles: jest.fn(),
  };
}

/**
 * Pre-configured mock scenarios for common test cases
 */
export const roleMockScenarios = {
  /**
   * Configures mock with a valid role
   */
  roleFound: (mockRepo: jest.Mocked<RoleRepositoryInterface>) => {
    const role = createRoleFixture();
    mockRepo.findById.mockResolvedValue(role);
  },

  /**
   * Configures mock to simulate role not found
   */
  roleNotFound: (mockRepo: jest.Mocked<RoleRepositoryInterface>) => {
    mockRepo.findById.mockResolvedValue(null);
    mockRepo.findRoleWithPermissions.mockResolvedValue(null);
  },

  /**
   * Configures mock to simulate database error
   */
  databaseError: (mockRepo: jest.Mocked<RoleRepositoryInterface>) => {
    const error = new Error("Database connection failed");
    mockRepo.findById.mockRejectedValue(error);
    mockRepo.findAll.mockRejectedValue(error);
    mockRepo.createRole.mockRejectedValue(error);
  },
};
