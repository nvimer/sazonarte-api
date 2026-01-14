import { PrismaClient, MenuItem, StockAdjustment } from "@prisma/client";
import { PrismaTransaction } from "../../../../types/prisma-transaction.types";

export class StockRepository {
  constructor(private prisma: PrismaClient) {}

  async findByIdForUpdate(
    tx: PrismaTransaction,
    itemId: number,
  ): Promise<MenuItem | null> {
    return await tx.menuItem.findUnique({
      where: {
        id: itemId,
        deleted: false,
      },
    });
  }

  async updateStock(
    tx: PrismaTransaction,
    itemId: number,
    data: Partial<MenuItem>,
  ): Promise<MenuItem> {
    return await tx.menuItem.update({
      where: { id: itemId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async createStockAdjustment(
    tx: PrismaTransaction,
    data: {
      menuItemId: number;
      adjustmentType: string;
      previousStock: number;
      newStock: number;
      quantity: number;
      reason?: string;
      userId?: string;
      orderId?: string;
    },
  ): Promise<StockAdjustment> {
    return await tx.stockAdjustment.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
    });
  }

  async findLowStockItems(): Promise<MenuItem[]> {
    return await this.prisma.menuItem.findMany({
      where: {
        inventoryType: "TRACKED",
        stockQuantity: {
          lte: this.prisma.menuItem.fields.lowStockAlert,
        },
        deleted: false,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOutOfStockItems(): Promise<MenuItem[]> {
    return await this.prisma.menuItem.findMany({
      where: {
        inventoryType: "TRACKED",
        stockQuantity: 0,
        deleted: false,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findStockHistory(itemId: number, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.stockAdjustment.findMany({
        where: {
          menuItemId: itemId,
        },
        include: {
          menuItem: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      this.prisma.stockAdjustment.count({
        where: {
          menuItemId: itemId,
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
