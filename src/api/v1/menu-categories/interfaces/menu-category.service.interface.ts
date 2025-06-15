import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "../category.validator";

export interface MenuCategoryServiceInterface {
  createMenuCategory(data: CreateMenuCategoryInput): Promise<MenuCategory>;
}
