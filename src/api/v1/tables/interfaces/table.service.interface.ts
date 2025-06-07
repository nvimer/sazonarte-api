import { Table } from "@prisma/client";
import { CreateTableInput } from "../table.validator";

export interface TableServiceInterface {
  createTable(data: CreateTableInput): Promise<Table>;
}
