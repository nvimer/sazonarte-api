import { Request, Response, NextFunction } from "express";
import { notFoundHandler } from "../../notFound.middleware";
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from "../helpers/middleware.mocks";
import { CustomError } from "../../../types/custom-errors";

describe("Not Found Middleware - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe("notFoundHandler", () => {
    it("should create CustomError with correct message including originalUrl", () => {
      // Arrange
      mockRequest.originalUrl = "/api/v1/nonexistent/route";

      // Act
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(CustomError);
      if (error instanceof CustomError) {
        expect(error.message).toBe(
          "Route not found - /api/v1/nonexistent/route",
        );
        expect(error.statusCode).toBe(404);
        expect(error.errorCode).toBe("NOT_FOUND");
      }
    });

    it("should include originalUrl in error message", () => {
      // Arrange
      mockRequest.originalUrl = "/api/v1/users/123/invalid";

      // Act
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(CustomError);
      if (error instanceof CustomError) {
        expect(error.message).toContain("/api/v1/users/123/invalid");
      }
    });

    it("should use status code 404", () => {
      // Arrange
      mockRequest.originalUrl = "/test";

      // Act
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(CustomError);
      if (error instanceof CustomError) {
        expect(error.statusCode).toBe(404);
      }
    });

    it("should use error code NOT_FOUND", () => {
      // Arrange
      mockRequest.originalUrl = "/test";

      // Act
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(CustomError);
      if (error instanceof CustomError) {
        expect(error.errorCode).toBe("NOT_FOUND");
      }
    });

    it("should call next() with the error", () => {
      // Arrange
      mockRequest.originalUrl = "/api/v1/test";

      // Act
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as unknown;
      expect(error).toBeInstanceOf(CustomError);
    });
  });
});
