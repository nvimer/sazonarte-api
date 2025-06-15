import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { MenuCategoryServiceInterface } from "./interfaces/menu-category.service.interface";
import { CreateMenuCategoryInput } from "./menu-category.validator";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import menuCategoryService from "./menu-category.service";

class MenuCategoryController {
  constructor(private menuCategoryService: MenuCategoryServiceInterface) {}

  postMenuCategory = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateMenuCategoryInput = req.body;
    const menuCategory =
      await this.menuCategoryService.createMenuCategory(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Menu Category created successfully",
      data: menuCategory,
    });
  });
}

export default new MenuCategoryController(menuCategoryService);
