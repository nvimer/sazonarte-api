import { Table, TableStatus } from "@prisma/client";
import { TableRepositoryInterface } from "./interfaces/table.repository.interface";
import { CreateTableInput, UpdateTableInput } from "./table.validator";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../interfaces/pagination.interfaces";
import prisma from "../../../database/prisma";
import { createPaginatedResponse } from "../../../utils/pagination.helper";

class TableRepository implements TableRepositoryInterface {
  async findAll(params: PaginationParams): Promise<PaginatedResponse<Table>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [tables, total] = await Promise.all([
      prisma.table.findMany({
        where: { deleted: false },
        orderBy: { number: "asc" },
        skip,
        take: limit,
      }),
      prisma.table.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(tables, total, params);
  }

  async findById(id: number): Promise<Table> {
    const table = await prisma.table.findFirst({
      where: { id, deleted: false },
    });
    if (!table) {
      throw new Error("Table not found");
    }
    return table;
  }

  async create(data: CreateTableInput): Promise<Table> {
    return await prisma.table.create({ data });
  }

  async update(id: number, data: UpdateTableInput): Promise<Table> {
    return await prisma.table.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.table.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() },
    });
  }

  async updateStatus(id: number, status: TableStatus): Promise<Table> {
    return await prisma.table.update({
      where: { id },
      data: { status },
    });
  }
}

export default new TableRepository();
