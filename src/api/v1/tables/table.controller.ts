import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { TableServiceInterface } from "./interfaces/table.service.interface";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import tableService from "./table.service";

class TableController {
  constructor(private tableService: TableServiceInterface) {}

  postTable = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const table = this.tableService.createTable(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Table created succesfully",
      data: table,
    });
  });
}

export default new TableController(tableService);
