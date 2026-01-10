import request from "supertest";
import { testDatabaseClient } from "../../../../../tests/setup";
import { createValidOrderPayload } from "../mocks";
import app from "../../../../../app";
import {
  setupTestMenuItem,
  setupTestUser,
} from "../../../../../tests/helpers/database-helpers";

describe("Orders API - E2E Tests", () => {
  let authToken: string;
  let testUser: any;
  let testMenuItem: any;

  beforeAll(async () => {
    // Setup test data
    testUser = await setupTestUser(testDatabaseClient);
    testMenuItem = await setupTestMenuItem(testDatabaseClient);

    // Get auth token
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "password123",
    });

    authToken = loginResponse.body.data.token;
  });

  beforeEach(async () => {
    // Clean up orders before each test
    await testDatabaseClient.order.deleteMany();
  });

  afterAll(async () => {
    await testDatabaseClient.$disconnect();
  });

  describe("POST /api/v1/orders", () => {
    test("should create order successfully", async () => {
      // Arrange
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;

      // Act
      const response = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.status).toBe("PENDING");
      expect(response.body.data.items).toHaveLength(1);
    });

    test("should return 400 for invalid data", async () => {
      // Arrange
      const invalidOrderData = {
        tableId: "invalid",
        type: "INVALID_TYPE",
        items: [],
      };

      // Act
      const response = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidOrderData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test("should return 401 without authentication", async () => {
      // Arrange
      const orderData = createValidOrderPayload();

      // Act
      const response = await request(app)
        .post("/api/v1/orders")
        .send(orderData)
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/orders", () => {
    test("should return paginated orders", async () => {
      // Arrange - Create some orders first
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;

      await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      // Act
      const response = await request(app)
        .get("/api/v1/orders?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty("page");
      expect(response.body.meta).toHaveProperty("total");
    });
  });

  describe("GET /api/v1/orders/:id", () => {
    test("should return specific order", async () => {
      // Arrange - Create order
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;

      const createResponse = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      const orderId = createResponse.body.data.id;

      // Act
      const response = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.items).toHaveLength(1);
    });

    test("should return 404 for non-existent order", async () => {
      // Act
      const response = await request(app)
        .get("/api/v1/orders/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/v1/orders/:id/status", () => {
    test("should update order status", async () => {
      // Arrange - Create order
      const orderData = createValidOrderPayload();
      orderData.items[0].menuItemId = testMenuItem.id;

      const createResponse = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData);

      const orderId = createResponse.body.data.id;

      // Act
      const response = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "IN_KITCHEN" })
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("IN_KITCHEN");
    });
  });
});
