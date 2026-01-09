import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

// Test database client
const testDatabaseClient = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.TEST_DATABASE_URL ||
        "postgresql://test:test@localhost:5432/sazonarte_test",
    },
  },
  log:
    process.env.NODE_ENV === "test" ? [] : ["query", "info", "warn", "error"],
});

// Global test setup
beforeAll(async () => {
  try {
    // Reset database before all tests
    if (process.env.NODE_ENV === "test") {
      execSync("npx prisma migrate reset --force --skip-seed", {
        env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
        stdio: "pipe",
      });
    }

    await testDatabaseClient.$connect();
    console.log("✅ Test database connected");
  } catch (error) {
    console.error("❌ Failed to setup test database:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await testDatabaseClient.$disconnect();
    console.log("✅ Test database disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting test database:", error);
  }
});

// Clean up database before each test
beforeEach(async () => {
  if (process.env.NODE_ENV === "test") {
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
