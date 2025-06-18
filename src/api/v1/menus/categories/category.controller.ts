import { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler";
import { CategoryServiceInterface } from "./interfaces/category.service.interface";
import { CreateMenuCategoryInput } from "./category.validator";
import { HttpStatus } from "../../../../utils/httpStatus.enum";
import categoryService from "./category.service";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";
import { logger } from "../../../../config/logger";

class CategoryController {
  constructor(private categoryService: CategoryServiceInterface) {}

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const limit = Number(req.query.limit) || DEFAULT_LIMIT;

    const params: PaginationParams = { page, limit };
    const categories = await this.categoryService.findCategories(params);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Menu Categories fetched successfully",
      data: categories,
    });
  });

  getCategory = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    logger.info(`here is id ${id}`);
    const menuCategory = await this.categoryService.findCategoryById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Menu Category fetched successfully",
      data: menuCategory,
    });
  });

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
