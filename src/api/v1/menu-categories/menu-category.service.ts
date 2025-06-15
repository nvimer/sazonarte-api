import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "./menu-category.validator";
import { MenuCategoryServiceInterface } from "./interfaces/menu-category.service.interface";
import { MenuCategoryRepositoryInterface } from "./interfaces/menu-category.repository.interface";
import menuCategoryRepository from "./menu-category.repository";

class MenuCategoryService implements MenuCategoryServiceInterface {
  constructor(
    private menuCategoryServiceRepository: MenuCategoryRepositoryInterface,
  ) {}

  async createMenuCategory(
    data: CreateMenuCategoryInput,
  ): Promise<MenuCategory> {
    return await this.menuCategoryServiceRepository.create(data);
  }
}

export default new MenuCategoryService(menuCategoryRepository);
