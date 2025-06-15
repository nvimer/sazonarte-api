import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "./category.validator";
import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";
import prisma from "../../../../database/prisma";

class CategoryRepository implements CategoryRepositoryInterface {
  async create(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    return await prisma.menuCategory.create({ data });
  }
}

export default new CategoryRepository();
