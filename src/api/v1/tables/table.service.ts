import { Table } from "@prisma/client";
import { TableServiceInterface } from "./interfaces/table.service.interface";
import { CreateTableInput } from "./table.validator";
import { TableRepositoryInterface } from "./interfaces/table.repository.interface";
import tableRepository from "./table.repository";

class TableService implements TableServiceInterface {
  constructor(private tableRepository: TableRepositoryInterface) {}

  async createTable(data: CreateTableInput): Promise<Table> {
    return this.tableRepository.create(data);
  }
}

export default new TableService(tableRepository);
