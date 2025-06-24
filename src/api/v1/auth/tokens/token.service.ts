import "dotenv/config";
import jwt from "jsonwebtoken";
import moment, { Moment } from "moment";
import {
  TokenRepositoryInterface,
  TokenServiceInterface,
} from "./token.interface";
import { AuthTokenResponseInput, PayloadInput } from "./token.validation";
import { Token, TokenType } from "@prisma/client";
import tokenRepository from "./token.repository";

/**
 * Token Service
 *
 * Core business logic layer for JWT token management operations.
 * This service is responsible for:
 * - JWT token generation and signing
 * - Token expiration management
 * - Access and refresh token creation
 * - Token storage and persistence
 * - Token security and validation
 *
 * The service follows the dependency injection pattern and
 * implements the TokenServiceInterface for consistency.
 *
 * Token management includes:
 * - Access token generation for API authentication
 * - Refresh token generation for session renewal
 * - Token expiration configuration
 * - Token storage in database for tracking
 *
 * Security Features:
 * - JWT signing with secret key
 * - Configurable token expiration times
 * - Token blacklisting support
 * - Secure payload structure
 *
 */
class TokenService implements TokenServiceInterface {
  constructor(private tokenRepository: TokenRepositoryInterface) {}

  /**
   * Generates a JWT token with the specified parameters.
   * This private method creates and signs JWT tokens with
   * a customized payload containing user identification
   * and token metadata.
   *
   * Token Payload Structure:
   * - sub: User ID (subject)
   * - iat: Issued at timestamp (Unix timestamp)
   * - exp: Expiration timestamp (Unix timestamp)
   * - type: Token type (ACCESS/REFRESH)
   *
   * Security Features:
   * - Uses environment variable for secret key
   * - Includes token type for validation
   * - Timestamp-based expiration
   * - JWT standard compliance
   */
  private generateToken(
    id: string,
    expires: Moment,
    type: TokenType,
    secret: string = String(process.env.JWT_SECRET),
  ): string {
    // create a personalizate payload where save necesary values for token in auth user.
    const payload: PayloadInput = {
      sub: id,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    // sign the transaction qith payload values and secret value
    return jwt.sign(payload, secret);
  }

  /**
   * Saves a token to the database for tracking and management.
   * This private method persists token information to enable
   * features like token blacklisting and session management.
   *
   * Database Operations:
   * - Stores token hash for security
   * - Records token type and expiration
   * - Tracks blacklist status
   * - Associates token with user
   *
   * Use Cases:
   * - Token revocation and blacklisting
   * - Session tracking and management
   * - Security audit and monitoring
   * - Token lifecycle management
   */
  private async saveToken(
    id: string,
    token: string,
    type: TokenType,
    expires: Moment,
    blacklisted: boolean = false,
  ): Promise<Token> {
    const newToken = await this.tokenRepository.saveToken(
      id,
      token,
      type,
      expires,
      blacklisted,
    );
    return newToken;
  }

  /**
   * Generates a complete authentication token pair for a user.
   * This method creates both access and refresh tokens, saves
   * the refresh token to the database, and returns the token pair.
   *
   * Token Generation Process:
   * - Creates access token with short expiration (minutes)
   * - Creates refresh token with long expiration (days)
   * - Saves refresh token to database for tracking
   * - Returns both tokens with expiration information
   *
   * Token Configuration:
   * - Access token: Short-lived for API authentication
   * - Refresh token: Long-lived for session renewal
   * - Expiration times configured via environment variables
   * - Refresh tokens stored for revocation capability
   *
   * Response Structure:
   * - access: Access token with expiration
   * - refresh: Refresh token with expiration
   *
   * Security Features:
   * - Separate expiration times for different token types
   * - Refresh token persistence for management
   * - Environment-based configuration
   * - Token type differentiation
   *
   * Use Cases:
   * - User login and authentication
   * - Session establishment
   * - API access authorization
   * - Token-based security
   */
  async generateAuthToken(id: string): Promise<AuthTokenResponseInput> {
    const accessTokenExpires = moment().add(
      process.env.JWT_ACCESS_EXPIRATION_MINUTES,
      "minutes",
    );
    const accessToken = this.generateToken(
      id,
      accessTokenExpires,
      TokenType.ACCESS,
    );

    const refreshTokenExpires = moment().add(
      process.env.JWT_ACCESS_EXPIRATION_DAYS,
      "days",
    );

    const refreshToken = this.generateToken(
      id,
      refreshTokenExpires,
      TokenType.REFRESH,
    );

    await this.saveToken(
      id,
      refreshToken,
      TokenType.REFRESH,
      refreshTokenExpires,
    );
    return {
      access: {
        token: accessToken,
        expires: String(accessTokenExpires.toDate()),
      },
      refresh: {
        token: refreshToken,
        expires: String(refreshTokenExpires.toDate()),
      },
    };
  }
}

export default new TokenService(tokenRepository);
