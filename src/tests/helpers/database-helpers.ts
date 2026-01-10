import { Prisma } from "@prisma/client";
import { testDatabaseClient } from "../setup";
import { logger } from "../../config/logger";

export const setupTestUser = async (overrides: Partial<any> = {}) => {
  const userData = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "hashedpassword123",
    isActive: true,
    ...overrides,
  };

  return await testDatabaseClient.user.create({ data: userData });
};

export const setupTestMenuItem = async (overrides: Partial<any> = {}) => {
  const menuItemData = {
    name: "Test Item",
    description: "Test Description",
    price: new Prisma.Decimal("10.00"),
    isExtra: false,
    isAvailable: true,
    categoryId: 1,
    inventoryType: "UNLIMITED",
    stockQuantity: null,
    initialStock: 100,
    lowStockAlert: 5,
    autoMarkUnavailable: true,
    imageUrl: null,
    ...overrides,
  };

  return await testDatabaseClient.menuItem.create({ data: menuItemData });
};

export const setupTestTable = async (overrides: Partial<any> = {}) => {
  const tableData = {
    number: 1,
    capacity: 4,
    status: "AVAILABLE",
    ...overrides,
  };

  return await testDatabaseClient.table.create({ data: tableData });
};

export const setupTestOrder = async (overrides: Partial<any> = {}) => {
  const orderData = {
    tableId: 1,
    type: "DINE_IN",
    status: "PENDING",
    items: [],
    totalAmount: new Prisma.Decimal("0.00"),
    notes: null,
    whatsappOrderId: null,
    customerId: null,
    waiterId: "waiter-123",
    ...overrides,
  };

  return await testDatabaseClient.order.create({ data: orderData });
};

export const setupTestOrderItem = async (
  itemId: string,
  overrides: Partial<any> = {},
) => {
  const itemData = {
    orderId: itemId,
    menuItemId: testMenuItem.id,
    quantity: 2,
    notes: "Test item notes",
    priceAtOrder: new Prisma.Decimal("12.75"),
    ...overrides,
  };

  return await testDatabaseClient.orderItem.create({ data: itemData });
};

export const cleanupTestData = async () => {
  // Limpiar en orden correcta para evitar errores de foreign key
  await testDatabaseClient.order.deleteMany();
  await testDatabaseClient.orderItem.deleteMany();
  await testDatabaseClient.stockAdjustment.deleteMany();
  await testDatabaseClient.menuCategory.deleteMany();
  await testDatabaseClient.table.deleteMany();
  await testDatabaseClient.user.deleteMany();
  await testDatabaseClient.role.deleteMany();
  await testDatabaseClient.permission.deleteMany();

  logger.info("🧹 Test data cleaned up successfully");
};
