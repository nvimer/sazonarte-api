import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../validation.middleware";
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from "../helpers/middleware.mocks";
import { ZodError } from "zod";

describe("Validation Middleware - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe("validate - Body validation", () => {
    it("should call next() when body validation passes", async () => {
      // Arrange
      const schema = z.object({
        body: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      mockRequest.body = {
        name: "Test User",
        age: 25,
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next() after promise resolves
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next() with ZodError when body validation fails", async () => {
      // Arrange
      const schema = z.object({
        body: z.object({
          name: z.string().min(3, "Name must be at least 3 characters"),
          age: z.number().positive("Age must be positive"),
        }),
      });

      mockRequest.body = {
        name: "AB", // Too short
        age: -5, // Negative
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next(error) when promise rejects
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors).toHaveLength(2);
      }
    });

    it("should validate nested body objects correctly", async () => {
      // Arrange
      const schema = z.object({
        body: z.object({
          user: z.object({
            firstName: z.string(),
            lastName: z.string(),
          }),
        }),
      });

      mockRequest.body = {
        user: {
          firstName: "John",
          lastName: "Doe",
        },
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next() after promise resolves
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("validate - Query validation", () => {
    it("should call next() when query validation passes", async () => {
      // Arrange
      const schema = z.object({
        query: z.object({
          page: z.string().transform((val) => parseInt(val, 10)),
          limit: z.string().transform((val) => parseInt(val, 10)),
        }),
      });

      mockRequest.query = {
        page: "1",
        limit: "20",
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next() after promise resolves
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next() with ZodError when query validation fails", async () => {
      // Arrange
      const schema = z.object({
        query: z.object({
          page: z.string().regex(/^\d+$/, "Page must be a number"),
        }),
      });

      mockRequest.query = {
        page: "invalid",
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next(error) when promise rejects
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("validate - Params validation", () => {
    it("should call next() when params validation passes", async () => {
      // Arrange
      const schema = z.object({
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10)),
        }),
      });

      mockRequest.params = {
        id: "123",
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next() after promise resolves
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next() with ZodError when params validation fails", async () => {
      // Arrange
      const schema = z.object({
        params: z.object({
          id: z.string().uuid("ID must be a valid UUID"),
        }),
      });

      mockRequest.params = {
        id: "invalid-uuid",
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next(error) when promise rejects
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("validate - Combined validation", () => {
    it("should validate body, query, and params together", async () => {
      // Arrange
      const schema = z.object({
        body: z.object({
          name: z.string(),
        }),
        query: z.object({
          page: z.string(),
        }),
        params: z.object({
          id: z.string(),
        }),
      });

      mockRequest.body = { name: "Test" };
      mockRequest.query = { page: "1" };
      mockRequest.params = { id: "123" };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next() after promise resolves
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should fail if any part of combined validation fails", async () => {
      // Arrange
      const schema = z.object({
        body: z.object({
          name: z.string().min(3),
        }),
        query: z.object({
          page: z.string(),
        }),
        params: z.object({
          id: z.string(),
        }),
      });

      mockRequest.body = { name: "AB" }; // Too short
      mockRequest.query = { page: "1" };
      mockRequest.params = { id: "123" };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next(error) when promise rejects
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("validate - Optional fields", () => {
    it("should pass validation when optional fields are missing", async () => {
      // Arrange
      const schema = z.object({
        body: z.object({
          name: z.string(),
          description: z.string().optional(),
        }),
      });

      mockRequest.body = {
        name: "Test",
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next() after promise resolves
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("validate - Error handling", () => {
    it("should handle validation errors gracefully", async () => {
      // Arrange
      const schema = z.object({
        body: z.object({
          email: z.string().email("Invalid email format"),
        }),
      });

      mockRequest.body = {
        email: "not-an-email",
      };

      const validationMiddleware = validate(schema);

      // Act
      await validationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert - asyncHandler calls next(error) when promise rejects
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors[0].message).toContain("email");
      }
    });
  });
});
