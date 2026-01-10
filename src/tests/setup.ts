import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { logger } from "../config/logger";
import { config } from "../config";

// Test database client
const testDatabaseClient = new PrismaClient({
  datasources: {
    db: {
      url: config.testDatabaseUrl,
    },
  },
  log: config.nodeEnv === "test" ? [] : ["query", "info", "warn", "error"],
});

// Global test setup
beforeAll(async () => {
  try {
    // Reset database before all tests
    if (config.nodeEnv === "test") {
      execSync("npx prisma migrate reset --force --skip-seed", {
        env: { ...process.env, DATABASE_URL: config.testDatabaseUrl },
        stdio: "pipe",
      });
    }

    await testDatabaseClient.$connect();
    logger.info("✅ Test database connected");
  } catch (error) {
    logger.error("❌ Failed to setup test database:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await testDatabaseClient.$disconnect();
    logger.info("✅ Test database disconnected");
  } catch (error) {
    logger.error("❌ Error disconnecting test database:", error);
  }
});

// Clean up database before each test
beforeEach(async () => {
  if (config.nodeEnv === "test") {
    // Delete in correct order due to foreign key constraints
    await testDatabaseClient.orderItem.deleteMany();
    await testDatabaseClient.order.deleteMany();
    await testDatabaseClient.stockAdjustment.deleteMany();
    await testDatabaseClient.menuItem.deleteMany();
    await testDatabaseClient.menuCategory.deleteMany();
    await testDatabaseClient.user.deleteMany();
    await testDatabaseClient.role.deleteMany();
    await testDatabaseClient.permission.deleteMany();
    await testDatabaseClient.table.deleteMany();
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);

export { testDatabaseClient };
