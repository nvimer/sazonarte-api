/**
 * Profile Test Helpers - Single Entry Point
 *
 * This file re-exports all profile test utilities for easy importing.
 *
 * @example
 * import {
 *   // Fixtures (pure objects, no DB)
 *   createProfileFixture,
 *   createUserWithProfileFixture,
 *   PROFILE_FIXTURES,
 *
 *   // Mocks (Jest mock factories)
 *   createMockProfileRepository,
 *   profileMockScenarios,
 * } from "../helpers";
 */

// ============================================
// FIXTURES - Pure objects for unit tests
// ============================================
export {
  createProfileFixture,
  createCompleteProfileFixture,
  createUserWithProfileFixture,
  createDeletedProfileFixture,
  PROFILE_FIXTURES,
} from "./profile.fixtures";

// ============================================
// MOCKS - Jest mock factories for unit tests
// ============================================
export {
  createMockProfileRepository,
  createMockProfileService,
  profileMockScenarios,
} from "./profile.mocks";
