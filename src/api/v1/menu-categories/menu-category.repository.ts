import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "./menu-category.validator";
import { MenuCategoryRepositoryInterface } from "./interfaces/menu-category.repository.interface";
import prisma from "../../../database/prisma";

class MenuCategoryRepository implements MenuCategoryRepositoryInterface {
  async create(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    return await prisma.menuCategory.create({ data });
  }
}

export default new MenuCategoryRepository();
