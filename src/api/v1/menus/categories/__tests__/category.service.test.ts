import { HttpStatus } from "../../../../../utils/httpStatus.enum";
import { CustomError } from "../../../../../types/custom-errors";
import type { MenuCategory } from "@prisma/client";
import type {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
} from "../category.validator";

// Mock the repository module consumed by the service singleton
const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  bulkDelete: jest.fn(),
  search: jest.fn(),
  findByName: jest.fn(),
};

jest.mock("../category.repository", () => ({
  __esModule: true,
  default: mockRepo,
}));

import CategoryService from "../category.service";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CategoryService", () => {
  const baseCategory: MenuCategory = {
    id: 1,
    name: "Main",
    description: "desc",
    active: true,
    order: 1,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as MenuCategory;

  test("createCategory: creates when name not duplicated", async () => {
    mockRepo.findByName.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(baseCategory);

    const input: CreateMenuCategoryInput = {
      name: "Main",
      description: "desc",
      order: 1,
    } as CreateMenuCategoryInput;
    const result = await CategoryService.createCategory(input);
    expect(mockRepo.findByName).toHaveBeenCalledWith("Main");
    expect(mockRepo.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(baseCategory);
  });

  test("createCategory: throws on duplicate name", async () => {
    mockRepo.findByName.mockResolvedValue(baseCategory);
    const input: CreateMenuCategoryInput = {
      name: "Main",
      description: "desc",
      order: 1,
    } as CreateMenuCategoryInput;
    await expect(CategoryService.createCategory(input)).rejects.toMatchObject({
      statusCode: HttpStatus.CONFLICT,
      errorCode: "DUPLICATE_NAME",
    } satisfies Partial<CustomError>);
  });

  test("findCategoryById: returns existing category", async () => {
    mockRepo.findById.mockResolvedValue(baseCategory);
    const result = await CategoryService.findCategoryById(1);
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(baseCategory);
  });

  test("findCategoryById: throws when not found", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(CategoryService.findCategoryById(999)).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: "ID_NOT_FOUND",
    } satisfies Partial<CustomError>);
  });

  test("updateCategory: validates existence and duplicate name, then updates", async () => {
    mockRepo.findById.mockResolvedValue(baseCategory);
    mockRepo.findByName.mockResolvedValue(null);
    mockRepo.update.mockResolvedValue({ ...baseCategory, name: "New" });
    const input: UpdateMenuCategoryInput = {
      name: "New",
    } as UpdateMenuCategoryInput;
    const result = await CategoryService.updateCategory(1, input);
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.findByName).toHaveBeenCalledWith("New");
    expect(mockRepo.update).toHaveBeenCalledWith(1, input);
    expect(result.name).toBe("New");
  });

  test("deleteCategory: soft deletes if not already deleted", async () => {
    mockRepo.findById.mockResolvedValue(baseCategory);
    mockRepo.delete.mockResolvedValue({ ...baseCategory, deleted: true });
    const result = await CategoryService.deleteCategory(1);
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
    expect(result.deleted).toBe(true);
  });

  test("deleteCategory: throws if already deleted", async () => {
    mockRepo.findById.mockResolvedValue({ ...baseCategory, deleted: true });
    await expect(CategoryService.deleteCategory(1)).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: "ALREADY_DELETED",
    } satisfies Partial<CustomError>);
  });
});
