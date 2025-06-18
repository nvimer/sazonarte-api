import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "./category.validator";
import { CategoryServiceInterface } from "./interfaces/category.service.interface";
import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";
import categoryRepository from "./category.repository";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";

class CategoryService implements CategoryServiceInterface {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}
  async findCategories(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuCategory>> {
    return await this.categoryRepository.findAll(params);
  }

  async findCategory(id: number): Promise<MenuCategory | null> {
    return await this.categoryRepository.findById(id);
  }

  async createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    return await this.categoryRepository.create(data);
  }
}

export default new CategoryService(categoryRepository);
