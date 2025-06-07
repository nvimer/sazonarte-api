import { Table } from "@prisma/client";
import { TableRepositoryInterface } from "./interfaces/table.repository.interface";
import { CreateTableInput } from "./table.validator";
import prisma from "../../../database/prisma";

class TableRepository implements TableRepositoryInterface {
  async create(data: CreateTableInput): Promise<Table> {
    return await prisma.table.create({ data });
  }
}

export default new TableRepository();
