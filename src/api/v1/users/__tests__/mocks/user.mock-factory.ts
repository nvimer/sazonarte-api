import { User } from "@prisma/client";
import { faker } from "@faker-js/faker";

/**
 * Mock factory for User entities
 * Generates realistic test data for User objects
 */
export class UserMockFactory {
  /**
   * Create a base mock user with realistic data
   */
  static createUser(overrides: Partial<User> = {}): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
    });

    return {
      id: faker.string.uuid(),
      firstName,
      lastName,
      email,
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      deleted: faker.datatype.boolean(),
      deletedAt: faker.datatype.boolean() ? faker.date.past() : null,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Create multiple users with realistic data
   */
  static createUsers(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, (_, index) =>
      this.createUser({
        ...overrides,
        email: `user${index + 1}@${faker.internet.domainName()}`,
        id: faker.string.uuid(),
      }),
    );
  }

  /**
   * Create an active user (not deleted)
   */
  static createActiveUser(overrides: Partial<User> = {}): User {
    return this.createUser({
      deleted: false,
      deletedAt: null,
      ...overrides,
    });
  }

  /**
   * Create an inactive user (deleted)
   */
  static createInactiveUser(overrides: Partial<User> = {}): User {
    return this.createUser({
      deleted: true,
      deletedAt: faker.date.past(),
      ...overrides,
    });
  }

  /**
   * Create a user with specific email
   */
  static createWithEmail(email: string, overrides: Partial<User> = {}): User {
    return this.createUser({
      email,
      ...overrides,
    });
  }

  /**
   * Create a user with specific ID
   */
  static createWithId(id: string, overrides: Partial<User> = {}): User {
    return this.createUser({
      id,
      ...overrides,
    });
  }

  /**
   * Create a user with authentication data
   */
  static createWithAuthData(overrides: Partial<User> = {}): User {
    return this.createUser({
      deleted: false,
      deletedAt: null,
      password: faker.internet.password({ length: 12 }),
      ...overrides,
    });
  }

  /**
   * Create admin user
   */
  static createAdminUser(overrides: Partial<User> = {}): User {
    return this.createUser({
      firstName: "Admin",
      lastName: "User",
      email: "admin@sazonarte.com",
      deleted: false,
      deletedAt: null,
      ...overrides,
    });
  }

  /**
   * Create test user for login scenarios
   */
  static createTestUser(overrides: Partial<User> = {}): User {
    return this.createUser({
      firstName: "Test",
      lastName: "User",
      email: "test@sazonarte.com",
      phone: "1234567890",
      deleted: false,
      deletedAt: null,
      password: "testPassword123",
      ...overrides,
    });
  }

  /**
   * Create a user with registration data
   */
  static createRegistrationData(
    overrides: Partial<User> = {},
  ): Omit<User, "id" | "createdAt" | "updatedAt"> {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      firstName,
      lastName,
      email: faker.internet.email({
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
      }),
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      deleted: false,
      deletedAt: null,
      ...overrides,
    };
  }

  /**
   * Create user data for update scenarios
   */
  static createUpdateData(overrides: Partial<User> = {}): Partial<User> {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      ...overrides,
    };
  }

  /**
   * Create user data with invalid email for testing
   */
  static createWithInvalidEmail(overrides: Partial<User> = {}): User {
    return this.createUser({
      email: "invalid-email",
      ...overrides,
    });
  }

  /**
   * Create user data with invalid phone for testing
   */
  static createWithInvalidPhone(overrides: Partial<User> = {}): User {
    return this.createUser({
      phone: "123",
      ...overrides,
    });
  }

  /**
   * Create user with short name for validation testing
   */
  static createWithShortName(overrides: Partial<User> = {}): User {
    return this.createUser({
      firstName: "A",
      lastName: "B",
      ...overrides,
    });
  }

  /**
   * Create user with long name for validation testing
   */
  static createWithLongName(overrides: Partial<User> = {}): User {
    return this.createUser({
      firstName: "A".repeat(51),
      lastName: "B".repeat(51),
      ...overrides,
    });
  }

  /**
   * Create user with weak password for testing
   */
  static createWithWeakPassword(overrides: Partial<User> = {}): User {
    return this.createUser({
      password: "123",
      ...overrides,
    });
  }
}

// Default export for convenience
export default UserMockFactory;
