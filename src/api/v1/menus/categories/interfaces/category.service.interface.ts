import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "../category.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../../interfaces/pagination.interfaces";

export interface CategoryServiceInterface {
  findCategories(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuCategory>>;
  findCategory(id: number): Promise<MenuCategory | null>;
  createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory>;
}
