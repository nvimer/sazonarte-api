import { TokenType } from "@prisma/client";
import moment from "moment";

// Create mock functions
const mockCreate = jest.fn();
const mockDeleteMany = jest.fn();

// Mock Prisma
jest.mock("../../../../../database/prisma", () => ({
  __esModule: true,
  default: {
    token: {
      create: mockCreate,
      deleteMany: mockDeleteMany,
    },
  },
}));

import tokenRepository from "../../token.repository";
import { createTokenFixture } from "../helpers";

describe("TokenRepository - Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveToken", () => {
    it("should save refresh token with default values", async () => {
      // Arrange
      const mockToken = createTokenFixture();
      mockCreate.mockResolvedValue(mockToken);

      // Act
      const result = await tokenRepository.saveToken(
        "user-123",
        "jwt-token-string",
        TokenType.REFRESH,
      );

      // Assert
      expect(result).toEqual(mockToken);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          token: "jwt-token-string",
          type: TokenType.REFRESH,
          expires: expect.any(Date),
          blacklisted: false,
        },
      });
    });

    it("should save access token", async () => {
      // Arrange
      const mockToken = createTokenFixture({ type: TokenType.ACCESS });
      mockCreate.mockResolvedValue(mockToken);

      // Act
      const result = await tokenRepository.saveToken(
        "user-123",
        "access-token-string",
        TokenType.ACCESS,
      );

      // Assert
      expect(result.type).toBe(TokenType.ACCESS);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: TokenType.ACCESS,
        }),
      });
    });

    it("should save token with custom expiration", async () => {
      // Arrange
      const customExpiration = moment.utc().add(7, "days");
      const mockToken = createTokenFixture({
        expires: customExpiration.toDate(),
      });
      mockCreate.mockResolvedValue(mockToken);

      // Act
      const result = await tokenRepository.saveToken(
        "user-123",
        "jwt-token-string",
        TokenType.REFRESH,
        customExpiration,
      );

      // Assert
      expect(result).toEqual(mockToken);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expires: customExpiration.toDate(),
        }),
      });
    });

    it("should save blacklisted token", async () => {
      // Arrange
      const mockToken = createTokenFixture({ blacklisted: true });
      mockCreate.mockResolvedValue(mockToken);

      // Act
      const result = await tokenRepository.saveToken(
        "user-123",
        "jwt-token-string",
        TokenType.REFRESH,
        moment.utc(),
        true,
      );

      // Assert
      expect(result.blacklisted).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          blacklisted: true,
        }),
      });
    });
  });

  describe("deleteRefreshTokenByUserId", () => {
    it("should delete all refresh tokens for user", async () => {
      // Arrange
      mockDeleteMany.mockResolvedValue({ count: 2 });

      // Act
      const result =
        await tokenRepository.deleteRefreshTokenByUserId("user-123");

      // Assert
      expect(result).toBe(2);
      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          type: TokenType.REFRESH,
        },
      });
    });

    it("should return 0 when no tokens found", async () => {
      // Arrange
      mockDeleteMany.mockResolvedValue({ count: 0 });

      // Act
      const result =
        await tokenRepository.deleteRefreshTokenByUserId("non-existent-user");

      // Assert
      expect(result).toBe(0);
    });

    it("should only delete REFRESH type tokens", async () => {
      // Arrange
      mockDeleteMany.mockResolvedValue({ count: 1 });

      // Act
      await tokenRepository.deleteRefreshTokenByUserId("user-123");

      // Assert
      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          type: TokenType.REFRESH,
        }),
      });
    });
  });
});
