import { Table } from "@prisma/client";
import { CreateTableInput } from "../table.validator";

export interface TableRepositoryInterface {
  create(data: CreateTableInput): Promise<Table>;
}
