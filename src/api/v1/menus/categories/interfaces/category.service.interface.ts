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
  createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory>;
}
