import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { TableServiceInterface } from "./interfaces/table.service.interface";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import tableService from "./table.service";
import { PaginationParams } from "../../../interfaces/pagination.interfaces";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from "../../../interfaces/pagination.interfaces";

class TableController {
  constructor(private tableService: TableServiceInterface) {}

  getTables = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    const params: PaginationParams = { page, limit };
    const tables = await this.tableService.findAllTables(params);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Tables fetched successfully",
      data: tables.data,
      meta: tables.meta,
    });
  });

  getTableById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const table = await this.tableService.findTableById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Table fetched successfully",
      data: table,
    });
  });

  postTable = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const table = await this.tableService.createTable(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  });

  updateTable = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const table = await this.tableService.updateTable(id, data);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });
  });

  deleteTable = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await this.tableService.deleteTable(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Table deleted successfully",
    });
  });

  updateTableStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const table = await this.tableService.updateTableStatus(id, status);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Table status updated successfully",
      data: table,
    });
  });
}

export default new TableController(tableService);
