import { OrderStatus, OrderType } from "../../../../../types/prisma.types";
import { Prisma } from "@prisma/client";

// Order base fixture
export const createBaseOrder = (overrides: Partial<any> = {}) => ({
  id: "order-123",
  status: OrderStatus.PENDING,
  type: OrderType.DINE_IN,
  totalAmount: new Prisma.Decimal("25.50"),
  notes: null,
  whatsappOrderId: null,
  tableId: 1,
  customerId: null,
  waiterId: "waiter-123",
  createdAt: new Date(),
  updatedAt: new Date(),
  deleted: false,
  deletedAt: null,
  ...overrides,
});

// Order with items fixture
export const createOrderWithItems = (overrides: Partial<any> = {}) => ({
  ...createBaseOrder(),
  items: [
    {
      id: "item-123",
      orderId: "order-123",
      menuItemId: 1,
      quantity: 2,
      priceAtOrder: new Prisma.Decimal("12.75"),
      notes: "Sin cebolla",
      isFreeSubstitution: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      menuItem: {
        id: 1,
        name: "Hamburguesa Clásica",
        description: "Hamburguesa con carne, lechuga, tomate",
        price: new Prisma.Decimal("12.75"),
        isExtra: false,
        isAvailable: true,
        categoryId: 1,
        inventoryType: "TRACKED",
        stockQuantity: 50,
        initialStock: 100,
        lowStockAlert: 5,
        autoMarkUnavailable: true,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
        deletedAt: null,
      },
    },
  ],
  ...overrides,
});

// Valid order payload for API
export const createValidOrderPayload = () => ({
  tableId: 1,
  type: "DINE_IN" as OrderType,
  items: [
    {
      menuItemId: 1,
      quantity: 2,
      notes: "Sin cebolla",
    },
  ],
});

// Invalid order payloads
export const createInvalidOrderPayloads = () => ({
  emptyItems: {
    tableId: 1,
    type: "DINE_IN" as OrderType,
    items: [],
  },
  invalidTableId: {
    tableId: "invalid",
    type: "DINE_IN" as OrderType,
    items: [{ menuItemId: 1, quantity: 1 }],
  },
  invalidType: {
    tableId: 1,
    type: "INVALID_TYPE" as any,
    items: [{ menuItemId: 1, quantity: 1 }],
  },
  negativeQuantity: {
    tableId: 1,
    type: "DINE_IN" as OrderType,
    items: [{ menuItemId: 1, quantity: -1 }],
  },
});

// Order status transitions
export const createOrderStatusTransitions = () => ({
  valid: [
    { from: OrderStatus.PENDING, to: OrderStatus.SENT_TO_CASHIER },
    { from: OrderStatus.SENT_TO_CASHIER, to: OrderStatus.PAID },
    { from: OrderStatus.PAID, to: OrderStatus.IN_KITCHEN },
    { from: OrderStatus.IN_KITCHEN, to: OrderStatus.READY },
    { from: OrderStatus.READY, to: OrderStatus.DELIVERED },
  ],
  invalid: [
    { from: OrderStatus.DELIVERED, to: OrderStatus.PENDING },
    { from: OrderStatus.CANCELLED, to: OrderStatus.IN_KITCHEN },
  ],
});
