import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../validation.middleware";

// Mock asyncHandler
jest.mock("../../utils/asyncHandler", () => ({
  asyncHandler: (fn: any) => fn,
}));

describe("Validation Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  test("validates correct request data", async () => {
    const schema = z.object({
      body: z.object({
        name: z.string().min(1),
        age: z.number(),
      }),
    });

    mockReq.body = { name: "John", age: 25 };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test("validates query parameters", async () => {
    const schema = z.object({
      query: z.object({
        page: z.string().transform(Number),
        limit: z.string().transform(Number),
      }),
    });

    mockReq.query = { page: "1", limit: "10" };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test("validates URL parameters", async () => {
    const schema = z.object({
      params: z.object({
        id: z.string().transform(Number),
      }),
    });

    mockReq.params = { id: "123" };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test("validates complex nested data", async () => {
    const schema = z.object({
      body: z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        preferences: z.array(z.string()),
      }),
    });

    mockReq.body = {
      user: { name: "John", email: "john@example.com" },
      preferences: ["dark-mode", "notifications"],
    };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test("throws error for invalid data", async () => {
    const schema = z.object({
      body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
    });

    mockReq.body = { name: "", email: "invalid-email" };

    const middleware = validate(schema);

    await expect(
      middleware(mockReq as Request, mockRes as Response, mockNext),
    ).rejects.toThrow();
  });

  test("throws error for missing required fields", async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });

    mockReq.body = { name: "John" }; // missing age

    const middleware = validate(schema);

    await expect(
      middleware(mockReq as Request, mockRes as Response, mockNext),
    ).rejects.toThrow();
  });

  test("throws error for wrong data types", async () => {
    const schema = z.object({
      body: z.object({
        age: z.number(),
        active: z.boolean(),
      }),
    });

    mockReq.body = { age: "not-a-number", active: "not-a-boolean" };

    const middleware = validate(schema);

    await expect(
      middleware(mockReq as Request, mockRes as Response, mockNext),
    ).rejects.toThrow();
  });

  test("validates with transformations", async () => {
    const schema = z.object({
      body: z.object({
        id: z.string().transform(Number),
        tags: z.string().transform((str) => str.split(",")),
      }),
    });

    mockReq.body = { id: "123", tags: "tag1,tag2,tag3" };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });
});
