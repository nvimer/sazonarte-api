import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "./category.validator";
import { CategoryServiceInterface } from "./interfaces/category.service.interface";
import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";
import categoryRepository from "./category.repository";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";
import { CustomError } from "../../../../types/custom-errors";
import { HttpStatus } from "../../../../utils/httpStatus.enum";

class CategoryService implements CategoryServiceInterface {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}

  private async findCategoryByIdOrFail(id: number): Promise<MenuCategory> {
    const menuCategory = await this.categoryRepository.findById(id);
    if (!menuCategory)
      throw new CustomError(
        `Menu Category ID ${id} not found`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return menuCategory;
  }

  async findCategories(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuCategory>> {
    return await this.categoryRepository.findAll(params);
  }

  async findCategoryById(id: number): Promise<MenuCategory> {
    return await this.findCategoryByIdOrFail(id);
  }

  async createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    return await this.categoryRepository.create(data);
  }
}

export default new CategoryService(categoryRepository);
