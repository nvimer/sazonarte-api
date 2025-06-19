import { MenuCategory } from "@prisma/client";
import {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
} from "../category.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../../interfaces/pagination.interfaces";

export interface CategoryServiceInterface {
  findCategories(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuCategory>>;
  findCategoryById(id: number): Promise<MenuCategory>;
  createCategory(data: CreateMenuCategoryInput): Promise<MenuCategory>;
  updateCategory(
    id: number,
    data: UpdateMenuCategoryInput,
  ): Promise<MenuCategory>;
}
