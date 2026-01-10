import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../../order.validator";

describe("Order Validator - Unit Tests", () => {
  describe("createOrderSchema", () => {
    test("should validate correct order data", () => {
      // Arrange
      const validData = {
        body: {
          tableId: 1,
          type: "DINE_IN",
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

    test("should reject empty items array", () => {
      // Arrange
      const invalidData = {
        body: {
          tableId: 1,
          type: "DINE_IN",
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
          type: "DINE_IN",
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
          type: "DINE_IN",
          items: [{ menuItemId: 1, quantity: -1 }],
        },
      };

      // Act & Assert
      expect(() => createOrderSchema.parse(invalidData)).toThrow();
    });
  });

  describe("updateOrderStatusSchema", () => {
    test("should validate correct status update", () => {
      // Arrange
      const validData = {
        body: {
          status: "IN_KITCHEN",
        },
      };

      // Act & Assert
      expect(() => updateOrderStatusSchema.parse(validData)).not.toThrow();
    });

    test("should reject invalid status", () => {
      // Arrange
      const invalidData = {
        body: {
          status: "INVALID_STATUS",
        },
      };

      // Act & Assert
      expect(() => updateOrderStatusSchema.parse(invalidData)).toThrow();
    });
  });
});
