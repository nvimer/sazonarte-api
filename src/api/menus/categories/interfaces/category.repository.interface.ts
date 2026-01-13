import { MenuCategory } from "@prisma/client";
import {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
  CategorySearchParams,
} from "../category.validator";
import {
  PaginatedResponse,
  PaginationParams,
} from "../../../../interfaces/pagination.interfaces";

export interface CategoryRepositoryInterface {
  findAll(params: PaginationParams): Promise<PaginatedResponse<MenuCategory>>;
  findById(id: number): Promise<MenuCategory | null>;
  findByName(name: string): Promise<MenuCategory | null>;
  create(data: CreateMenuCategoryInput): Promise<MenuCategory>;
  update(id: number, data: UpdateMenuCategoryInput): Promise<MenuCategory>;
  delete(id: number): Promise<MenuCategory>;
  bulkDelete(ids: number[]): Promise<number>;
  search(
    params: PaginationParams & CategorySearchParams,
  ): Promise<PaginatedResponse<MenuCategory>>;
}
