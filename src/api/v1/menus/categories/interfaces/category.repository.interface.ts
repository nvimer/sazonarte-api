import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "../category.validator";

export interface CategoryRepositoryInterface {
  create(data: CreateMenuCategoryInput): Promise<MenuCategory>;
}
