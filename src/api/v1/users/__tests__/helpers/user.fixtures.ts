/**
 * User Fixtures - Pure JavaScript Objects for Unit Tests
 *
 * These fixtures create mock User objects WITHOUT database interaction.
 * Use them in unit tests where you need to mock repository responses.
 *
 * Key characteristics:
 * - Synchronous (no async/await)
 * - No database dependency
 * - Fast execution
 * - Predictable values for assertions
 *
 * @example
 * const mockUser = createUserFixture({ email: "custom@test.com" });
 * mockRepository.findById.mockResolvedValue(mockUser);
 */
import { User } from "@prisma/client";

/**
 * Base user fixture with default values
 * Override any field by passing an object with the desired values
 */
export function createUserFixture(overrides: Partial<User> = {}): User {
  return {
    id: "user-fixture-id-001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@fixture.test",
    password: "hashedPassword$2b$10$XXXXXXXXXXXX",
    phone: "3001234567",
    deleted: false,
    deletedAt: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

/**
 * Creates multiple user fixtures with unique identifiers
 */
export function createUserFixtures(
  count: number,
  overrides: Partial<User> = {}
): User[] {
  return Array.from({ length: count }, (_, index) =>
    createUserFixture({
      id: `user-fixture-id-${String(index + 1).padStart(3, "0")}`,
      email: `user${index + 1}@fixture.test`,
      firstName: `User${index + 1}`,
      ...overrides,
    })
  );
}

/**
 * Creates a soft-deleted user fixture
 */
export function createDeletedUserFixture(overrides: Partial<User> = {}): User {
  return createUserFixture({
    deleted: true,
    deletedAt: new Date("2024-06-15T12:00:00.000Z"),
    ...overrides,
  });
}

/**
 * Creates an admin user fixture
 */
export function createAdminUserFixture(overrides: Partial<User> = {}): User {
  return createUserFixture({
    id: "admin-fixture-id-001",
    firstName: "Admin",
    lastName: "User",
    email: "admin@fixture.test",
    ...overrides,
  });
}

/**
 * Creates a waiter user fixture
 */
export function createWaiterUserFixture(overrides: Partial<User> = {}): User {
  return createUserFixture({
    id: "waiter-fixture-id-001",
    firstName: "Waiter",
    lastName: "Staff",
    email: "waiter@fixture.test",
    ...overrides,
  });
}

/**
 * Creates a cashier user fixture
 */
export function createCashierUserFixture(overrides: Partial<User> = {}): User {
  return createUserFixture({
    id: "cashier-fixture-id-001",
    firstName: "Cashier",
    lastName: "Staff",
    email: "cashier@fixture.test",
    ...overrides,
  });
}

/**
 * Creates a user fixture without password (for response mocking)
 */
export function createUserWithoutPasswordFixture(
  overrides: Partial<Omit<User, "password">> = {}
): Omit<User, "password"> {
  const { password: _, ...userWithoutPassword } = createUserFixture(overrides);
  return userWithoutPassword;
}
