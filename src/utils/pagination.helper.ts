import {
  PaginationParams,
  PaginatedResponse,
} from "../interfaces/pagination.interfaces";

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  const { page, limit } = params;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
}
