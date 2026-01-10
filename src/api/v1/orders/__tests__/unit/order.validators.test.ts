import {
  createOrderSchema,
  orderIdSchema,
  orderSearchSchema,
  updateOrderStatusSchema,
} from "../../order.validator";
import { OrderType, OrderStatus } from "../../../../../types/prisma.types";

describe("Order Validator - Unit Tests", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  describe("createOrderSchema", () => {
    test("should validate correct order data", () => {
      // Arrange
      const validData = {
        body: {
          tableId: 1,
          type: OrderType.DINE_IN,
          items: [
            {
              menuItemId: 1,
              quantity: 2,
              notes: "Sin cebolla",
            },
          ],
        },
      };

      // Act & Assert
      expect(() => createOrderSchema.parse(validData)).not.toThrow();
    });

    test("should validate order without tableId (TAKE_OUT)", () => {
      const validData = {
        body: {
          type: OrderType.TAKE_OUT,
          items: [{ menuItemId: 1, quantity: 1 }],
        },
      };

      expect(() => createOrderSchema.parse(validData)).not.toThrow();
    });

    test("should reject empty itms array", () => {
      // Arrange
      const invalidData = {
        body: {
          tableId: 1,
          type: OrderType.DINE_IN,
          items: [],
        },
      };

      // Act & Assert
      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });

    test("should reject invalid tableId", () => {
      // Arrange
      const invalidData = {
        body: {
          tableId: "invalid",
          type: OrderType.DINE_IN,
          items: [{ menuItemId: 1, quantity: 1 }],
        },
      };

      // Act & Assert
      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });

    test("should reject negative quantity", () => {
      // Arrange
      const invalidData = {
        body: {
          tableId: 1,
          type: OrderType.DINE_IN,
          items: [{ menuItemId: 1, quantity: -1 }],
        },
      };

      // Act & Assert
      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });

    test("should reject zero quantity", () => {
      const invalidData = {
        body: {
          tableId: 1,
          type: OrderType.DINE_IN,
          items: [{ menuItemId: 1, quantity: 0 }],
        },
      };

      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });

    test("should reject invalid order type", () => {
      const invalidData = {
        body: {
          tableId: 1,
          type: "INVALID_TYPE",
          items: [{ menuItemId: 1, quantity: 1 }],
        },
      };

      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });

    test("should accept valid customerId UUID", () => {
      const validData = {
        body: {
          type: OrderType.DELIVERY,
          customerId: validUUID,
          items: [{ menuItemId: 1, quantity: 1 }],
        },
      };

      expect(() => createOrderSchema.parse(validData)).not.toThrow();
    });

    test("should reject invalid customerId format", () => {
      const invalidData = {
        body: {
          type: OrderType.DELIVERY,
          customerId: "not-a-uuid",
          items: [{ menuItemId: 1, quantity: 1 }],
        },
      };

      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });
  });

  describe("updateOrderStatusSchema", () => {
    test("should validate correct status update", () => {
      const validData = {
        params: { id: validUUID },
        body: { status: OrderStatus.IN_KITCHEN },
      };

      expect(() => updateOrderStatusSchema.parse(validData)).not.toThrow();
    });

    test("should validate all valid statuses", () => {
      const statuses = Object.values(OrderStatus);

      statuses.forEach((status) => {
        const validData = {
          params: { id: validUUID },
          body: { status },
        };

        expect(() => updateOrderStatusSchema.parse(validData)).not.toThrow();
      });
    });

    test("should reject invalid status", () => {
      const invalidData = {
        params: { id: validUUID },
        body: { status: "INVALID_STATUS" },
      };

      expect(() => updateOrderStatusSchema.parse(invalidData)).toThrow();
    });

    test("should reject missing params", () => {
      const invalidData = {
        body: { status: OrderStatus.IN_KITCHEN },
      };

      expect(() => updateOrderStatusSchema.parse(invalidData)).toThrow();
    });

    test("should reject invalid UUID in params", () => {
      const invalidData = {
        params: { id: "not-a-uuid" },
        body: { status: OrderStatus.IN_KITCHEN },
      };

      expect(() => updateOrderStatusSchema.parse(invalidData)).toThrow();
    });
  });

  describe("orderIdSchema", () => {
    test("should validate correct UUID", () => {
      const validData = {
        params: { id: validUUID },
      };

      expect(() => orderIdSchema.parse(validData)).not.toThrow();
    });

    test("should reject invalid UUID", () => {
      const invalidData = {
        params: { id: "invalid-id" },
      };

      expect(() => orderIdSchema.parse(invalidData)).toThrow();
    });
  });

  describe("orderSearchSchema", () => {
    test("should validate empty query", () => {
      const validData = { query: {} };

      expect(() => orderSearchSchema.parse(validData)).not.toThrow();
    });

    test("should validate status filter", () => {
      const validData = {
        query: { status: OrderStatus.PENDING },
      };

      expect(() => orderSearchSchema.parse(validData)).not.toThrow();
    });

    test("should validate type filter", () => {
      const validData = {
        query: { type: OrderType.DINE_IN },
      };

      expect(() => orderSearchSchema.parse(validData)).not.toThrow();
    });

    test("should validate waiterId filter", () => {
      const validData = {
        query: { waiterId: validUUID },
      };

      expect(() => orderSearchSchema.parse(validData)).not.toThrow();
    });

    test("should validate tableId filter", () => {
      const validData = {
        query: { tableId: 5 },
      };

      expect(() => orderSearchSchema.parse(validData)).not.toThrow();
    });

    test("should validate combined filters", () => {
      const validData = {
        query: {
          status: OrderStatus.IN_KITCHEN,
          type: OrderType.DINE_IN,
          tableId: 3,
        },
      };

      expect(() => orderSearchSchema.parse(validData)).not.toThrow();
    });
  });
});
