import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "../category.validator";

export interface MenuCategoryRepositoryInterface {
  create(data: CreateMenuCategoryInput): Promise<MenuCategory>;
}
