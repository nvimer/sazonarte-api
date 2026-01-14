import { User } from "@prisma/client";
import { ProfileServices } from "../../profile.service";
import { ProfileRepositoryInterface } from "../../interfaces/profile.repository.interface";
import { createMockProfileRepository } from "../helpers";
import {
  createUserWithProfileFixture,
  createProfileFixture,
} from "../helpers/profile.fixtures";
import { CustomError } from "../../../../types/custom-errors";
import { HttpStatus } from "../../../../utils/httpStatus.enum";
import {
  PaginationParams,
  PaginatedResponse,
} from "../../../../interfaces/pagination.interfaces";
import { UpdateProfileInput } from "../../profile.validator";
import { UserWithProfile } from "../../../../types/prisma.types";

describe("ProfileServices - Unit Tests", () => {
  let profileService: ProfileServices;
  let mockProfileRepository: jest.Mocked<ProfileRepositoryInterface>;

  const createPaginatedResponse = <T>(
    data: T[],
    overrides: Partial<PaginatedResponse<T>["meta"]> = {},
  ): PaginatedResponse<T> => ({
    data,
    meta: {
      total: data.length,
      page: 1,
      limit: 10,
      totalPages: Math.ceil(data.length / 10) || 1,
      hasNextPage: false,
      hasPreviousPage: false,
      ...overrides,
    },
  });

  beforeEach(() => {
    mockProfileRepository = createMockProfileRepository();
    profileService = new ProfileServices(mockProfileRepository);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated user profiles when valid params provided", async () => {
      // Arrange
      const params: PaginationParams = { page: 1, limit: 10 };
      const users = [
        createUserWithProfileFixture({ id: "user-1" }),
        createUserWithProfileFixture({ id: "user-2" }),
      ];
      const expectedResponse = createPaginatedResponse(users);

      mockProfileRepository.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await profileService.findAll(params);

      // Assert
      expect(mockProfileRepository.findAll).toHaveBeenCalledWith(params);
      expect(result).toEqual(expectedResponse);
      expect(result.data).toHaveLength(2);
    });

    it("should return empty list when no profiles exist", async () => {
      // Arrange
      const params: PaginationParams = { page: 1, limit: 10 };
      const emptyResponse = createPaginatedResponse<User>([]);

      mockProfileRepository.findAll.mockResolvedValue(emptyResponse);

      // Act
      const result = await profileService.findAll(params);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe("findById", () => {
    it("should return user profile when found", async () => {
      // Arrange
      const id = "user-123";
      const userWithProfile = createUserWithProfileFixture({ id });

      mockProfileRepository.findById.mockResolvedValue(userWithProfile);

      // Act
      const result = await profileService.findById(id);

      // Assert
      expect(mockProfileRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(userWithProfile);
    });

    it("should throw CustomError when user profile not found", async () => {
      // Arrange
      const id = "non-existent-user";
      mockProfileRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(profileService.findById(id)).rejects.toThrow(CustomError);
      await expect(profileService.findById(id)).rejects.toThrow(
        `User with ID ${id} not found.`,
      );

      try {
        await profileService.findById(id);
        fail("Expected error to be thrown");
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        if (error instanceof CustomError) {
          expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
          expect(error.errorCode).toBe("ID_NOT_FOUND");
        }
      }
    });
  });

  describe("updateUser", () => {
    it("should update user profile when valid data provided and user exists", async () => {
      // Arrange
      const id = "user-123";
      const input: UpdateProfileInput = {
        firstName: "Updated",
        lastName: "Name",
        phone: "3009876543",
      };
      const existing = createUserWithProfileFixture({ id });
      const updated = createUserWithProfileFixture({ id, ...input });

      mockProfileRepository.findById.mockResolvedValue(existing);
      mockProfileRepository.update.mockResolvedValue(updated);

      // Act
      const result = await profileService.updateUser(id, input);

      // Assert
      expect(mockProfileRepository.findById).toHaveBeenCalledWith(id);
      expect(mockProfileRepository.update).toHaveBeenCalledWith(id, input);
      expect(result).toEqual(updated);
    });

    it("should throw CustomError when user not found", async () => {
      // Arrange
      const id = "non-existent-user";
      const input: UpdateProfileInput = {
        firstName: "Updated",
      };

      mockProfileRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(profileService.updateUser(id, input)).rejects.toThrow(
        CustomError,
      );
      await expect(profileService.updateUser(id, input)).rejects.toThrow(
        `User with ID ${id} not found.`,
      );

      expect(mockProfileRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("getMyProfile", () => {
    it("should return user profile when user exists", async () => {
      // Arrange
      const id = "user-123";
      const userWithProfile = createUserWithProfileFixture({ id });

      mockProfileRepository.findById.mockResolvedValue(userWithProfile);

      // Act
      const result = await profileService.getMyProfile(id);

      // Assert
      expect(mockProfileRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(userWithProfile);
    });

    it("should throw CustomError when user not found", async () => {
      // Arrange
      const id = "non-existent-user";
      mockProfileRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(profileService.getMyProfile(id)).rejects.toThrow(
        CustomError,
      );
      await expect(profileService.getMyProfile(id)).rejects.toThrow(
        `User with ID ${id} not found.`,
      );

      try {
        await profileService.getMyProfile(id);
        fail("Expected error to be thrown");
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        if (error instanceof CustomError) {
          expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
          expect(error.errorCode).toBe("ID_NOT_FOUND");
        }
      }
    });
  });
});
