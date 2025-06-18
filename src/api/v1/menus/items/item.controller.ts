import { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { ItemServiceInteface } from "./interfaces/item.service.interface";
import { CreateItemInput } from "./item.validator";
import { HttpStatus } from "../../../../utils/httpStatus.enum";
import itemService from "./item.service";

class ItemController {
  constructor(private itemService: ItemServiceInteface) {}

  postItem = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateItemInput = req.body;
    const item = await this.itemService.createItem(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Item created successfully",
      data: item,
    });
  });
}

export default new ItemController(itemService);
