import { logger } from "../../../../../config/logger";
import {
  createMenuCategorySchema,
  updateMenuCategorySchema,
  categorySearchSchema,
  bulkCategorySchema,
} from "../category.validator";

describe("Category Validators", () => {
  describe("createMenuCategorySchema", () => {
    test("validates correct input", () => {
      const validInput = {
        body: {
          name: "Main Course",
          description: "Main dishes",
          order: 1,
        },
      };

      const result = createMenuCategorySchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.name).toBe("Main Course");
        expect(result.data.body.description).toBe("Main dishes");
        expect(result.data.body.order).toBe(1);
      }
    });

    test("validates name requirements", () => {
      const invalidInputs = [
        { body: { name: "", description: "test", order: 1 } }, // empty
        { body: { name: "ab", description: "test", order: 1 } }, // too short
        { body: { name: "a".repeat(101), description: "test", order: 1 } }, // too long
        { body: { name: 123, description: "test", order: 1 } }, // wrong type
        { body: { description: "test", order: 1 } }, // missing
      ];

      invalidInputs.forEach((input, index) => {
        const result = createMenuCategorySchema.safeParse(input);
        expect(result.success).toBe(false);
        logger.info(
          `Test ${index + 1} failed as expected:`,
          result.error?.issues[0]?.message,
        );
      });
    });

    test("validates order requirements", () => {
      const invalidInputs = [
        { body: { name: "test", description: "test", order: -1 } }, // negative
        { body: { name: "test", description: "test", order: 1000 } }, // too high
        { body: { name: "test", description: "test", order: "abc" } }, // string
        { body: { name: "test", description: "test" } }, // missing
      ];

      invalidInputs.forEach((input) => {
        const result = createMenuCategorySchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    test("coerces string numbers to integers", () => {
      const input = {
        body: {
          name: "Test",
          description: "Test",
          order: "5", // string number
        },
      };

      const result = createMenuCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.order).toBe(5);
        expect(typeof result.data.body.order).toBe("number");
      }
    });

    test("description is required field", () => {
      const input = {
        body: {
          name: "Test",
          order: 1,
          // description missing - should fail validation
        },
      };

      const result = createMenuCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Category description cannot be empty",
        );
      }
    });
  });

  describe("updateMenuCategorySchema", () => {
    test("validates partial updates", () => {
      const validInputs = [
        { body: { name: "Updated Name" } },
        { body: { description: "Updated description" } },
        { body: { order: 5 } },
        { body: { name: "New", order: 3 } },
      ];

      validInputs.forEach((input) => {
        const result = updateMenuCategorySchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    test("rejects empty update", () => {
      const input = { body: {} };
      const result = updateMenuCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain(
        "At least one field must be provided",
      );
    });

    test("validates individual field constraints", () => {
      const invalidInputs = [
        { body: { name: "ab" } }, // too short
        { body: { order: -1 } }, // negative
        { body: { order: 1000 } }, // too high
      ];

      invalidInputs.forEach((input) => {
        const result = updateMenuCategorySchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("categorySearchSchema", () => {
    test("validates search parameters", () => {
      const validInputs = [
        { query: {} },
        { query: { search: "pizza" } },
        { query: { active: "true" } },
        { query: { search: "pasta", active: "false" } },
      ];

      validInputs.forEach((input) => {
        const result = categorySearchSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    test("transforms active string to boolean", () => {
      const input = { query: { active: "true" } };
      const result = categorySearchSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.active).toBe(true);
      }
    });

    test("validates search term length", () => {
      const invalidInputs = [
        { query: { search: "" } }, // empty
        { query: { search: "a".repeat(101) } }, // too long
      ];

      invalidInputs.forEach((input) => {
        const result = categorySearchSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("bulkCategorySchema", () => {
    test("validates bulk operations", () => {
      const validInput = {
        body: {
          ids: [1, 2, 3, 4, 5],
        },
      };

      const result = bulkCategorySchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    test("rejects empty or invalid bulk operations", () => {
      const invalidInputs = [
        { body: { ids: [] } }, // empty array
        {
          body: {
            ids: [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
              36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
              52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67,
              68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
              84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
              100, 101,
            ],
          },
        }, // too many
        { body: { ids: [0] } }, // zero
        { body: { ids: [-1] } }, // negative
        { body: { ids: [1.5] } }, // decimal
        { body: { ids: ["abc"] } }, // string
      ];

      invalidInputs.forEach((input) => {
        const result = bulkCategorySchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });
});
