export {
  createOrderFixture,
  createOrderWithItemsFixture,
  createOrderWithRelationsFixture,
  createOrderPayload,
  createTakeOutOrderPayload,
  createDeliveryOrderPayload,
  invalidOrderPayloads,
  validStatusTransitions,
  invalidStatusTransitions,
} from "./order.fixtures";

// ============================================
// MENU ITEM FIXTURES - For order item testing
// ============================================
export {
  createMenuItemFixture,
  createTrackedMenuItemFixture,
  createUnlimitedMenuItemFixture,
  createOutOfStockMenuItemFixture,
  createUnavailableMenuItemFixture,
  createLowStockMenuItemFixture,
  createExtraMenuItemFixture,
  createBeverageMenuItemFixture,
} from "../../../menus/items/__tests__/helpers";

// ============================================
// MOCKS - Jest mock factories for unit tests
// ============================================
export {
  createMockOrderRepository,
  createMockOrderService,
  createMockItemService,
  itemServiceScenarios,
  orderRepositoryScenarios,
} from "./order.mocks";

// ============================================
// DATABASE - Real DB operations for integration tests
// ============================================
export {
  // Menu category and items
  createTestMenuCategory,
  createTestMenuItem,
  deleteAllTestMenuItems,
  // Orders
  createTestOrder,
  createTestOrderWithItems,
  createCompleteTestOrder,
  findTestOrderById,
  updateTestOrderStatus,
  getTestOrdersByWaiter,
  getTestOrdersByTable,
  countTestOrdersByStatus,
  deleteTestOrder,
  deleteAllTestOrders,
  // Tables
  createTestTable,
  deleteAllTestTables,
} from "./order.database";
