import { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { CategoryServiceInterface } from "./interfaces/category.service.interface";
import { CreateMenuCategoryInput } from "./category.validator";
import { HttpStatus } from "../../../../utils/httpStatus.enum";
import categoryService from "./category.service";

class CategoryController {
  constructor(private categoryService: CategoryServiceInterface) {}

  postCategory = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateMenuCategoryInput = req.body;
    const menuCategory = await this.categoryService.createCategory(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Menu Category created successfully",
      data: menuCategory,
    });
  });
}

export default new CategoryController(categoryService);
