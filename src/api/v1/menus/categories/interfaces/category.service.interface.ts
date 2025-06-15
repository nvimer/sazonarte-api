import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "../category.validator";

export interface CategoryServiceInterface {
  createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory>;
}
