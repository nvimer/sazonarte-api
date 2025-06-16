import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "../category.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../../interfaces/pagination.interfaces";

export interface CategoryRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<MenuCategory>>;
  create(data: CreateMenuCategoryInput): Promise<MenuCategory>;
}
