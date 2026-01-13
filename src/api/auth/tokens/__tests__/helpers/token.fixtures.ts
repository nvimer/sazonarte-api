import { Token, TokenType } from "@prisma/client";

export function createTokenFixture(overrides: Partial<Token> = {}): Token {
  return {
    id: "token-fixture-id-001",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fixture-token",
    type: TokenType.ACCESS,
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    blacklisted: false,
    userId: "user-fixture-id-001",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

/**
 * Creates an access token fixture
 */
export function createAccessTokenFixture(
  overrides: Partial<Token> = {},
): Token {
  return createTokenFixture({
    type: TokenType.ACCESS,
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    ...overrides,
  });
}

/**
 * Creates a refresh token fixture
 */
export function createRefreshTokenFixture(
  overrides: Partial<Token> = {},
): Token {
  return createTokenFixture({
    type: TokenType.REFRESH,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ...overrides,
  });
}

/**
 * Creates an expired token fixture
 */
export function createExpiredTokenFixture(
  overrides: Partial<Token> = {},
): Token {
  return createTokenFixture({
    expires: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago (expired)
    ...overrides,
  });
}

/**
 * Creates a blacklisted token fixture
 */
export function createBlacklistedTokenFixture(
  overrides: Partial<Token> = {},
): Token {
  return createTokenFixture({
    blacklisted: true,
    ...overrides,
  });
}

/**
 * Creates a reset password token fixture
 */
export function createResetPasswordTokenFixture(
  overrides: Partial<Token> = {},
): Token {
  return createTokenFixture({
    type: TokenType.RESET_PASSWORD,
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    ...overrides,
  });
}

/**
 * Creates a verify email token fixture
 */
export function createVerifyEmailTokenFixture(
  overrides: Partial<Token> = {},
): Token {
  return createTokenFixture({
    type: TokenType.VERIFY_EMAIL,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    ...overrides,
  });
}

/**
 * Pre-configured fixtures for common test scenarios
 */
export const TOKEN_FIXTURES = {
  access: createAccessTokenFixture(),
  refresh: createRefreshTokenFixture(),
  expired: createExpiredTokenFixture(),
  blacklisted: createBlacklistedTokenFixture(),
  resetPassword: createResetPasswordTokenFixture(),
  verifyEmail: createVerifyEmailTokenFixture(),
};
