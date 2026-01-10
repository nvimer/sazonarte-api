import { PrismaClient, User } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

/**
 * Database helper functions for User tests
 * Provides utilities to create, manage, and clean up user test data
 */

/**
 * Create a test user in the database
 */
export async function createTestUser(
  overrides: Partial<User> = {},
): Promise<User> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({
    firstName: firstName.toLowerCase(),
    lastName: lastName.toLowerCase(),
  });

  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      deleted: false,
      deletedAt: null,
      ...overrides,
    },
  });
}

/**
 * Create multiple test users in the database
 */
export async function createTestUsers(
  count: number,
  overrides: Partial<User> = {},
): Promise<User[]> {
  const users: any[] = [];
  for (let i = 0; i < count; i++) {
    users.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: `user${i + 1}@${faker.internet.domainName()}`,
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      deleted: false,
      deletedAt: null,
      ...overrides,
    });
  }

  await prisma.user.createMany({
    data: users,
  });

  return prisma.user.findMany({
    where: {
      email: {
        in: users.map((u) => u.email),
      },
    },
  });
}

/**
 * Create a test user with specific email
 */
export async function createTestUserWithEmail(
  email: string,
  overrides: Partial<User> = {},
): Promise<User> {
  return prisma.user.create({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email,
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      deleted: false,
      deletedAt: null,
      ...overrides,
    },
  });
}

/**
 * Create a test user with specific ID
 */
export async function createTestUserWithId(
  id: string,
  overrides: Partial<User> = {},
): Promise<User> {
  return prisma.user.create({
    data: {
      id,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      deleted: false,
      deletedAt: null,
      ...overrides,
    },
  });
}

/**
 * Create a deleted (inactive) test user
 */
export async function createDeletedTestUser(
  overrides: Partial<User> = {},
): Promise<User> {
  return prisma.user.create({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      deleted: true,
      deletedAt: faker.date.past(),
      ...overrides,
    },
  });
}

/**
 * Create an admin test user
 */
export async function createAdminTestUser(
  overrides: Partial<User> = {},
): Promise<User> {
  return prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@sazonarte.com",
      password: faker.internet.password({ length: 12 }),
      phone: "1234567890",
      deleted: false,
      deletedAt: null,
      ...overrides,
    },
  });
}

/**
 * Find a test user by email
 */
export async function findTestUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Find a test user by ID
 */
export async function findTestUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Get all test users (active only)
 */
export async function getAllTestUsers(): Promise<User[]> {
  return prisma.user.findMany({
    where: { deleted: false },
  });
}

/**
 * Get all test users (including deleted)
 */
export async function getAllTestUsersWithDeleted(): Promise<User[]> {
  return prisma.user.findMany();
}

/**
 * Count test users
 */
export async function countTestUsers(
  includeDeleted: boolean = false,
): Promise<number> {
  return prisma.user.count({
    where: includeDeleted ? {} : { deleted: false },
  });
}

/**
 * Soft delete a test user
 */
export async function softDeleteTestUser(id: string): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: {
      deleted: true,
      deletedAt: new Date(),
    },
  });
}

/**
 * Restore a soft deleted test user
 */
export async function restoreTestUser(id: string): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: {
      deleted: false,
      deletedAt: null,
    },
  });
}

/**
 * Update a test user
 */
export async function updateTestUser(
  id: string,
  data: Partial<User>,
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Delete all test users
 */
export async function deleteAllTestUsers(): Promise<void> {
  await prisma.user.deleteMany();
}

/**
 * Soft delete all test users
 */
export async function softDeleteAllTestUsers(): Promise<void> {
  await prisma.user.updateMany({
    data: {
      deleted: true,
      deletedAt: new Date(),
    },
  });
}

/**
 * Restore all soft deleted test users
 */
export async function restoreAllTestUsers(): Promise<void> {
  await prisma.user.updateMany({
    where: { deleted: true },
    data: {
      deleted: false,
      deletedAt: null,
    },
  });
}

/**
 * Clean up test users created during tests
 * This is typically called in afterEach or afterAll hooks
 */
export async function cleanupTestUsers(): Promise<void> {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "@test.com",
        mode: "insensitive",
      },
    },
  });
}

/**
 * Create test users with role assignments
 */
export async function createTestUserWithRole(
  roleId: number,
  overrides: Partial<User> = {},
): Promise<User> {
  const user = await createTestUser(overrides);

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId,
      assignedAt: new Date(),
    },
  });

  return user;
}

/**
 * Create test user with profile
 */
export async function createTestUserWithProfile(
  overrides: Partial<User> = {},
  profileOverrides: any = {},
): Promise<User> {
  const user = await createTestUser(overrides);

  await prisma.profile.create({
    data: {
      userId: user.id,
      photoUrl: faker.internet.url(),
      birthDate: faker.date.past(),
      identification: faker.string.alphanumeric(10),
      address: faker.location.streetAddress(),
      ...profileOverrides,
    },
  });

  return user;
}

/**
 * Get user with roles and permissions (for auth testing)
 */
export async function getTestUserWithRolesAndPermissions(
  id: string,
): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

// Default export with all functions
export default {
  createTestUser,
  createTestUsers,
  createTestUserWithEmail,
  createTestUserWithId,
  createDeletedTestUser,
  createAdminTestUser,
  findTestUserByEmail,
  findTestUserById,
  getAllTestUsers,
  getAllTestUsersWithDeleted,
  countTestUsers,
  softDeleteTestUser,
  restoreTestUser,
  updateTestUser,
  deleteAllTestUsers,
  softDeleteAllTestUsers,
  restoreAllTestUsers,
  cleanupTestUsers,
  createTestUserWithRole,
  createTestUserWithProfile,
  getTestUserWithRolesAndPermissions,
};
