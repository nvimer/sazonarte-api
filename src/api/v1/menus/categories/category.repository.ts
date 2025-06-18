import { MenuCategory } from "@prisma/client";
import { CreateMenuCategoryInput } from "./category.validator";
import { CategoryRepositoryInterface } from "./interfaces/category.repository.interface";
import prisma from "../../../../database/prisma";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";
import { createPaginatedResponse } from "../../../../utils/pagination.helper";

class CategoryRepository implements CategoryRepositoryInterface {
  async findAll(
    params: PaginationParams,
  ): Promise<PaginatedResponse<MenuCategory>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [menuCategories, total] = await Promise.all([
      prisma.menuCategory.findMany({
        where: { deleted: false },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.menuCategory.count({
        where: { deleted: false },
      }),
    ]);

    return createPaginatedResponse(menuCategories, total, params);
  }

  async findById(id: number): Promise<MenuCategory | null> {
    return await prisma.menuCategory.findUnique({ where: { id } });
  }

  async create(data: CreateMenuCategoryInput): Promise<MenuCategory> {
    return await prisma.menuCategory.create({ data });
  }
}

export default new CategoryRepository();
