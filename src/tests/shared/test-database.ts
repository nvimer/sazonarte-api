import { PrismaClient } from "@prisma/client";
import { config } from "../../config";

// Singleton test database client
let testDbClient: PrismaClient | null = null;

/**
 * Gets or creates the test database client singleton
 * @returns PrismaClient instance configured for testing
 */
export function getTestDatabaseClient(): PrismaClient {
  if (!testDbClient) {
    testDbClient = new PrismaClient({
      datasources: {
        db: {
          url: config.testDatabaseUrl,
        },
      },
      // Reduce logging noise during tests
      log: config.nodeEnv === "test" ? [] : ["warn", "error"],
    });
  }
  return testDbClient;
}

/**
 * Connects to the test database
 * Call this in beforeAll hooks for integration tests
 */
export async function connectTestDatabase(): Promise<void> {
  const client = getTestDatabaseClient();
  await client.$connect();
}

/**
 * Disconnects from the test database
 * Call this in afterAll hooks to clean up connections
 */
export async function disconnectTestDatabase(): Promise<void> {
  if (testDbClient) {
    await testDbClient.$disconnect();
    testDbClient = null;
  }
}

/**
 * Resets the database client (useful for test isolation)
 */
export function resetTestDatabaseClient(): void {
  testDbClient = null;
}
