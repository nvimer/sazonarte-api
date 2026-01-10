import { testDatabaseClient } from '../../../tests/setup';
import { OrderService } from '../../order.service';
import { OrderRepository } from '../../order.repository';
import { setupTestUser, setupTestMenuItem, setupTestOrder, setupTestOrderItem, cleanupTestData } from '../../../tests/helpers/database-helpers';

describe('OrderService - Integration Tests', () => {
  let orderService: OrderService;
  let orderRepository: OrderRepository;
  let testUser: any;
  let testMenuItem: any;
  let testOrder: any;
  let testOrderItem: any

  beforeAll(async () => {
    // Crear instancias reales
    orderRepository = new OrderRepository(testDatabaseClient);
    orderService = new OrderService(orderRepository);

    // Crear usuarios de prueba
    testUser = await setupTestUser();
    testMenuItem = await setupTestMenuItem();
    testOrder = await setupTestOrder();
    testOrderItem = await setupTestOrderItem();
  }, 5000);

  beforeEach(async () => {
    // Limpiar datos antes de cada test
    await cleanupTestData();
  });

  afterAll(async () => {
    // Desconectar de la base de datos
    await testDatabaseClient.$disconnect();
  }, 5000);

  describe('createOrder', () => {
    test('should create order in database successfully', async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: testUser.tables[0].id,
        type: 'DINE_IN',
        items: [
          {
            menuItemId: testMenuItem.id,
            quantity: 2,
            notes: 'Sin cebolla',
          },
        ],
      };

      // Act
      const result = await orderService.createOrder(waiterId, orderData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(result.items).toHaveLength(1);
    });

    test('should create order with multiple items', async () => {
      // Arrange
      const orderData = {
        tableId: testUser.tables[0].id,
        type: 'DINE_IN',
        items: [
          {
            menuItemId: testMenuItem.id,
            quantity: 2,
            notes: 'Sin cebolla',
          },
          {
            menuItemId: testMenuItem.id,
            quantity: 1,
            notes: 'Extra queso',
          },
        ],
      };

      // Act
      const result = await orderService.createOrder(waiterId, orderData);

      // Assert
      expect(result).toBeDefined();
      expect(result.items).toHaveLength(2);
      expect(result.items[0].quantity).toBe(2);
      expect(result.items[1].notes).toBe('Extra queso');
    });

    test('should calculate total amount correctly', async () => {
      // Arrange
      const orderData = {
        tableId: testUser.tables[0].id,
        type: 'DINE_IN',
        items: [
          {
            menuItemId: testMenuItem.id,
            quantity: 2,
            notes: 'Sin cebolla',
          },
          {
            menuItemId: testMenuItem.id,
            quantity: 1,
            notes: 'Extra queso',
          },
        ],
      };

      // Act
      const result = await orderService.createOrder(waiterId, orderData);

      // Assert
      const expectedTotal = testMenuItem.price.toNumber() * 2 + testMenuItem.price.toNumber() * 1;
      expect(result.totalAmount.toString()).toBe(expectedTotal.toString());
    });

    test('should throw error for empty items', async () => {
      // Arrange
      const orderData = {
        tableId: testUser.tables[0].id,
        type: 'DINE_IN',
        items: [],
      };

      // Act & Assert
      await expect(orderService.createOrder(waiterId, orderData))
        .rejects.toThrow();
    });

    test('should throw error for invalid tableId', async () => {
      // Arrange
      const orderData = {
        tableId: 'invalid', // Debe ser number
        type: 'DINE_IN',
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      // Act & Assert
      await expect(orderService.createOrder(waiterId, orderData))
        .rejects.toThrow();
    });

    test('should handle database errors', async () => {
      // Arrange
      const orderData = {
        tableId: 1,
        type: 'DINE_IN',
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      // Act
      const error = new Error('Database connection failed');
      orderRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(orderService.createOrder(waiterId, orderData))
        .rejects.toThrow('Database connection failed');
      expect(orderRepository.create).toHaveBeenCalledWith(waiterId, orderData);
    });
  });

  describe('findOrderById', () => {
    test('should find order by id successfully', async () => {
      // Arrange
      const orderId = testOrder.id;

      // Act
      const result = await orderService.findOrderById(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(orderId);
    });

    test('should return null when order not found', async () => {
      // Arrange
      const orderId = 'non-existent-id';

      // Act
      const result = await orderService.findOrderById(orderId);

      // Assert
      expect(result).toBeNull();
    });

    test('should handle repository errors', async () => {
      // Arrange
      const orderId = testOrder.id;
      const error = new Error('Database connection failed');
      orderRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(orderService.findOrderById(orderId))
        .rejects.toThrow('Database connection failed');
      expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
    });
  });

  describe('updateOrderStatus', () => {
    test('should update order status successfully', async () => {
      // Arrange
      const orderId = testOrder.id;
      const newStatus = 'IN_KITCHEN';

      // Act
      const result = await orderService.updateOrderStatus(orderId, newStatus);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('IN_KITCHEN');
    });

    test('should throw error for invalid status transitions', async () => {
      // Arrange
      const orderId = testOrder.id;
      const invalidStatus = 'INVALID_STATUS';

      // Act & Assert
      await expect(orderService.updateOrderStatus(orderId, invalidStatus))
        .rejects.toThrow();
    });
  });

  describe('cancelOrder', () => {
    test('should cancel order successfully', async () => {
      // Arrange
      const orderId = testOrder.id;
      const cancelledOrder = { ...testOrder, status: 'CANCELLED' };

      orderRepository.cancel.mockResolvedValue(cancelledOrder);

      // Act
      const result = await orderService.cancelOrder(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('CANCELLED');
      expect(orderRepository.cancel).toHaveBeenCalledWith(orderId);
    });

    test('should handle errors when cancelling order', async () => {
      // Arrange
      const orderId = testOrder.id;
      const error = new Error('Cannot cancel order');

      orderRepository.cancel.mockRejectedValue(error);

      // Act & Assert
      await expect(orderService.cancelOrder(orderId))
        .rejects.toThrow('Cannot cancel order');
      expect(orderRepository.cancel).toHaveBeenCalledWith(orderId);
    });
  });

  describe('findAllOrders', () => {
    test('should return paginated orders successfully', async () => {
      // Arrange
      const params = { page: 1, limit: 10 };

      // Act
      const testOrders = [await setupTestOrder(), await setupTestOrder()];

      // Mock response
      orderRepository.findAll.mockResolvedValue({
        data: testOrders,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 }
      });

      // Act
      const result = await orderService.findAllOrders(params);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(2);
    });

    test('should return empty list when no orders exist', async () => {
      // Arrange
      // Mock empty response
      orderRepository.findAll.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
      });

      // Act
      const result = await orderService.findAllOrders(params);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    test('should handle pagination correctly', async () => {
      // Arrange
      const params1 = { page: 1, limit: 5 };
      const params2 = { page: 2, limit: 5 };

      const testOrders1 = await orderService.findAllOrders(params1);
      const testOrders2 = await orderService.findAllOrders(params2);

      // Mock responses
      orderRepository.findAll
        .mockResolvedValueOnce({ data: testOrders1 })
        .mockResolvedValueOnce({ data: testOrders2 });

      // Act
      const result1 = await orderService.findAllOrders(params1);
      const result2 = await orderService.findAllOrders(params2);

      // Assert
      expect(result1.data).toHaveLength(5);
      expect(result1.meta.page).toBe(2);
      expect(result1.meta.currentPage).toBe(2);
      expect(result1.meta.total).toBe(7); // 2 + 5
      expect(result1.meta.totalPages).toBe(2);
    });
  });

  test('order workflow', () => {
    test('should handle complete order lifecycle', async () => {
      // Arrange
      const waiterId = testUser.id;
      const orderData = {
        tableId: testUser.tables[0].id,
        type: 'DINE_IN',
        items: [
          {
            menuItemId: testMenuItem.id,
            quantity: 2,
            notes: 'Sin cebolla',
          },
        ],
      };

      // Act - Complete workflow
      const order = await orderService.createOrder(waiterId, orderData);
      expect(order.status).toBe('PENDING');

      // Act - Send to cashier
      const sentToCashier = await orderService.updateOrderStatus(order.id, 'SENT_TO_CASHIER');
      expect(sentToCashier.status).toBe('SENT_TO_CASHIER');

      // Act - Mark as paid
      const paid = await orderService.updateOrderStatus(order.id, 'PAID');
      expect(paid.status).toBe('PAID');

      // Act - Send to kitchen
      const inKitchen = await orderService.updateOrderStatus(order.id, 'IN_KITCHEN');
      expect(inKitchen.status).toBe('IN_KITCHEN');

      // Act - Mark as ready
      const ready = await orderService.updateOrderStatus(order.id, 'READY');
      expect(ready.status).toBe('READY');

      // Act - Deliver
      const delivered = await orderService.updateOrderStatus(order.id, 'DELIVERED');
      expect(delivered.status).toBe('DELIVERED');

      // Assert - Final state in database
      const finalOrder = await orderService.findOrderById(order.id);
      expect(finalOrder?.status).toBe('DELIVERED');
    });
  });
});

afterAll(async () => {
  // Desconectar de la base de datos
  await testDatabaseClient.$disconnect();
}, 5000);

describe('createOrder', () => {
  test('should create order in database successfully', async () => {
    // Arrange
    const waiterId = testUser.id;
    const orderData = {
      tableId: testUser.tables[0].id,
      type: 'DINE_IN',
      items: [
        {
          menuItemId: testMenuItem.id,
          quantity: 2,
          notes: 'Sin cebolla',
        },
      ],
    };

    // Act
    const result = await orderService.createOrder(waiterId, orderData);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.status).toBe('PENDING');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].menuItemId).toBe(testMenuItem.id);
    expect(result.items[0].quantity).toBe(2);
    expect(result.items[0].notes).toBe('Sin cebolla');

    // Verificar en base de datos
    const dbOrder = await testDatabaseClient.order.findUnique({
      where: { id: result.id },
      include: {
        items: { include: { menuItem: true } }
      });

    expect(dbOrder).not.toBeNull();
    expect(dbOrder?.items).toHaveLength(1);
    expect(dbOrder?.items[0].menuItem.name).toBe(testMenuItem.name);
  });

  test('should create order with multiple items', async () => {
    // Arrange
    const orderData = {
      tableId: testUser.tables[0].id,
      type: 'DINE_IN',
      items: [
        {
          menuItemId: testMenuItem.id,
          quantity: 2,
          notes: 'Sin cebolla',
        },
        {
          menuItemId: testMenuItem.id,
          quantity: 1,
          notes: 'Extra queso',
        },
      ],
    };

    // Act
    const result = await orderService.createOrder(waiterId, orderData);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.items).toHaveLength(2);
    expect(result.items[0].quantity).toBe(2);
    expect(result.items[1].quantity).toBe(1);
    expect(result.items[0].notes).toBe('Extra queso');

    // Verificar en base de datos
    const dbOrder = await testDatabaseClient.order.findUnique({
      where: { id: result.id },
      include: {
        items: { include: { menuItem: true } }
      });

    expect(dbOrder).not.toBeNull();
    expect(dbOrder?.items).toHaveLength(2);
  });

  test('should calculate total amount correctly', async () => {
    // Arrange
    const orderData = {
      tableId: testUser.tables[0].id,
      type: 'DINE_IN',
      items: [
        {
          menuItemId: testMenuItem.id,
          quantity: 2,
          price: testMenuItem.price,
          notes: 'Sin cebolla',
        },
        {
          menuItemId: testMenuItem.id,
          quantity: 1,
          price: testMenuItem.price,
          notes: 'Extra queso',
        },
      ],
    };

    // Act
    const result = await orderService.createOrder(waiterId, orderData);

    // Assert
    expect(result).toBeDefined();
    const expectedTotal = testMenuItem.price.toNumber() * 2 + testMenuItem.price.toNumber() * 1;
    expect(result.totalAmount.toString()).toBe(expectedTotal.toString());
  });

  test('should throw error when repository fails', async () => {
    // Arrange
    const orderData = {
      tableId: testUser.tables[0].id,
      type: 'DINE_IN',
      items: [{ menuItemId: testMenuItem.id, quantity: 1, notes: 'Sin cebolla' }],
    };

    const error = new Error('Database connection failed');
    orderRepository.create.mockRejectedValue(error);

    // Act & Assert
    await expect(orderService.createOrder(waiterId, orderData))
      .rejects.toThrow('Database connection failed');
    expect(orderRepository.create).toHaveBeenCalledWith(waiterId, orderData);
  });
});

describe('findOrderById', () => {
  test('should find order by id successfully', async () => {
    // Arrange
    const order = await setupTestOrder();

    // Act
    const result = await orderService.findOrderById(order.id);

    // Assert
    expect(result).toBeDefined();
    expect(result?.id).toBe(order.id);
    expect(result?.status).toBe('PENDING');
    expect(result?.items).toHaveLength(1);
    expect(result?.items[0].menuItem.name).toBe(testMenuItem.name);
  });

  test('should return null when order not found', async () => {
    // Arrange
    const order = await setupTestOrder();

    // Act
    const result = await orderService.findOrderById('non-existent-id');

    // Assert
    expect(result).toBeNull();
  });

  test('should handle database errors', async () => {
    // Arrange
    const order = await setupTestOrder();
    const error = new Error('Connection failed');

    orderRepository.findById.mockRejectedValue(error);

    // Act & Assert
    await expect(orderService.findOrderById(order.id))
      .rejects.toThrow('Connection failed');
    expect(orderRepository.findById).toHaveBeenCalledWith(order.id);
  });
});

describe('updateOrderStatus', () => {
  test('should update order status successfully', async () => {
    // Arrange
    const order = await setupTestOrder();

    // Act
    const result = await orderService.updateOrderStatus(order.id, 'IN_KITCHEN');

    // Assert
    expect(result).toBeDefined();
    expect(result?.status).toBe('IN_KITCHEN');

    // Verify in database
    const dbOrder = await testDatabaseClient.order.findUnique({
      where: { id: result.id }
    });

    expect(dbOrder?.status).toBe('IN_KITCHEN');
  });

  test('should allow valid status transitions', async () => {
    // Arrange
    const order = await setupTestOrder();
    const validTransitions = [
      { from: 'PENDING', to: 'SENT_TO_CASHIER' },
      { from: 'SENT_TO_CASHIER', to: 'PAID' },
      { from: 'PAID', to: 'IN_KITCHEN' },
      { from: 'IN_KITCHEN', to: 'READY' },
      { from: "READY", to: "DELIVERED" },
    ];

    for (const transition of validTransitions) {
      // Act
      const result = await orderService.updateOrderStatus(order.id, transition.to);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(transition.to);
    }
  });

  test('should throw error for invalid status transitions', async () => {
    // Arrange
    const order = await setupTestOrder();
    const invalidTransitions = [
      { from: 'DELIVERED', to: 'PENDING' },
      { from: 'CANCELLED', to: 'IN_KITCHEN' },
    ];

    for (const transition of invalidTransitions) {
      // Act & Assert
      await expect(orderService.updateOrderStatus(order.id, transition.to))
        .rejects.toThrow();
    }
  });
});

describe('cancelOrder', () => {
  test('should cancel order successfully', async () => {
    // Arrange
    const order = await setupTestOrder();
    const cancelledOrder = { ...testOrder, status: 'CANCELLED' };

    orderRepository.cancel.mockResolvedValue(cancelledOrder);

    // Act
    const result = await orderService.cancelOrder(order.id);

    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe('CANCELLED');
    expect(result.id).toBe(order.id);
  });

  test('should handle errors when cancelling order', async () => {
    // Arrange
    const order = await setupTestOrder();
    const error = new Error('Cannot cancel order');

    orderRepository.cancel.mockRejectedValue(error);

    // Act & Assert
    await expect(orderService.cancelOrder(order.id))
      .rejects.toThrow('Cannot cancel order');
    expect(orderRepository.cancel).toHaveBeenCalledWith(order.id);
  });
});

describe('findAllOrders', () => {
  test('should return paginated orders successfully', async () => {
    // Arrange
    const params = { page: 1, limit: 10 };
    const testOrders = [await setupTestOrder(), await setupTestOrder()];

    // Mock response
    orderRepository.findAll.mockResolvedValue({
      data: testOrders,
      meta: { page: 1, limit: 10, total: 2, totalPages: 1 }
    });

    // Act
    const result = await orderService.findAllOrders(params);

    // Assert
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
    expect(result.meta).toBeDefined();
    expect(result.data).toHaveLength(2);
    expect(result.meta.currentPage).toBe(1);
    expect(result.meta.total).toBe(2);
  });

  test('should return empty list when no orders exist', async () => {
    // Arrange
    const params = { page: 1, limit: 10 };

    // Mock empty response
    orderRepository.findAll.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
    });

    // Act
    const result = await orderService.findAllOrders(params);

    // Assert
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });

  test('should handle pagination correctly', async () => {
    // Arrange
    const params1 = { page: 1, limit: 5 };
    const params2 = { page: 2, limit: 5 };
    const testOrders = [await setupTestOrder(), await setupTestOrder(), await setupTestOrder()];

    // Mock responses
    orderRepository.findAll.mockResolvedValueOnce({
      data: testOrders.slice(0, 5),
      meta: { page: 1, limit: 5, total: 2, totalPages: 1 }
    });
    orderRepository.findAll.mockResolvedValueOnce({
      data: testOrders.slice(5, 10),
      meta: { page: 2, limit: 5, total: 2, totalPages: 1 }
    });

    // Act
    const result1 = await orderService.findAllOrders(params1);
    const result2 = await orderService.findAllOrders(params2);

    // Assert
    expect(result1.data).toHaveLength(5);
    expect(result1.meta.currentPage).toBe(1);
    expect(result1.meta.total).toBe(2);
    expect(result2.data).toHaveLength(5);
    expect(result2.meta.currentPage).toBe(2);
    expect(result2.meta.total).toBe(2);
  });
});

describe('order workflow', () => {
  test('should handle complete order lifecycle', async () => {
    // Arrange
    const waiterId = testUser.id;
    const orderData = {
      tableId: testUser.tables[0].id,
      type: 'DINE_IN',
      items: [
        {
          menuItemId: testMenuItem.id,
          quantity: 2,
          notes: 'Sin cebolla',
        },
      ],
    };

    // Act - Create order
    const order = await orderService.createOrder(waiterId, orderData);
    expect(order.status).toBe('PENDING');

    // Act - Send to cashier
    const sentToCashier = await orderService.updateOrderStatus(order.id, 'SENT_TO_CASHIER');
    expect(sentToCashier.status).toBe('SENT_TO_CASHIER');

    // Act - Mark as paid
    const paid = await orderService.updateOrderStatus(order.id, 'PAID');
    expect(paid.status).toBe('PAID');

    // Act - Send to kitchen
    const inKitchen = await orderService.updateOrderStatus(order.id, 'IN_KITCHEN');
    expect(inKitchen.status).toBe('IN_KITCHEN');

    // Act - Mark as ready
    const ready = await orderService.updateOrderStatus(order.id, 'READY');
    expect(ready.status).toBe('READY');

    // Act - Deliver
    const delivered = await orderService.updateOrderStatus(order.id, 'DELIVERED');
    expect(delivered.status).toBe('DELIVERED');

    // Assert final state
    const finalOrder = await testDatabaseClient.order.findUnique({
      where: { id: order.id }
    });

    expect(finalOrder?.status).toBe('DELIVERED');
  });
});
});
