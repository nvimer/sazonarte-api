/**
 * User Test Helpers - Single Entry Point
 *
 * This file re-exports all user test utilities for easy importing.
 *
 * @example
 * // Import everything you need from one place
 * import {
 *   // Fixtures (pure objects, no DB)
 *   createUserFixture,
 *   createUserFixtures,
 *   createDeletedUserFixture,
 *
 *   // Mocks (Jest mock factories)
 *   createMockUserRepository,
 *   createMockUserService,
 *   userMockScenarios,
 *
 *   // Database (real DB operations)
 *   createTestUser,
 *   deleteAllTestUsers,
 * } from "../helpers";
 */

// ============================================
// FIXTURES - Pure objects for unit tests
// ============================================
export {
  createUserFixture,
  createUserFixtures,
  createDeletedUserFixture,
  createAdminUserFixture,
  createWaiterUserFixture,
  createCashierUserFixture,
  createUserWithoutPasswordFixture,
} from "./user.fixtures";

// ============================================
// MOCKS - Jest mock factories for unit tests
// ============================================
export {
  createMockUserRepository,
  createMockUserService,
  createMockRoleService,
  createMockHasherUtils,
  userMockScenarios,
} from "./user.mocks";

// ============================================
// DATABASE - Real DB operations for integration tests
// ============================================
export {
  createTestUser,
  createTestUsers,
  createTestUserWithEmail,
  createTestUserWithId,
  createTestUserWithRole,
  createTestUserWithProfile,
  createDeletedTestUser,
  findTestUserByEmail,
  findTestUserById,
  getTestUserWithRolesAndPermissions,
  updateTestUser,
  softDeleteTestUser,
  deleteTestUser,
  deleteAllTestUsers,
  countTestUsers,
} from "./user.database";
