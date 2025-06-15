import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "./category.validator";
import { CategoryServiceInterface } from "./interfaces/category.service.interface";
import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";
import categoryRepository from "./category.repository";

class CategoryService implements CategoryServiceInterface {
  constructor(private categoryServiceRepository: CategoryRepositoryInterface) {}

  async createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    return await this.categoryServiceRepository.create(data);
  }
}

export default new CategoryService(categoryRepository);
