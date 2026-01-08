import { Token, TokenType } from "@prisma/client";
import { AuthTokenResponseInput } from "./token.validation";
import { Moment } from "moment";

/**
 * Token Service Interface
 *
 * The interface defines core token management operations:
 * - JWT token generation and signing
 * - Access and refresh token creation
 * - Token expiration management
 * - Token security and validation
 */
export interface TokenServiceInterface {
  generateAuthToken(id: string): Promise<AuthTokenResponseInput>;
  logout(userId: string): Promise<void>;
}

/**
 * Token Repository Interface
 *
 * Defines the contract for token repository implementations.
 * This interface ensures consistency across different token repository
 * implementations and provides clear documentation of expected methods.
 *
 * The interface defines core token persistence operations:
 * - Token storage and retrieval
 * - Token lifecycle management
 * - Database interaction for tokens
 * - Token security and tracking
 */
export interface TokenRepositoryInterface {
  saveToken(
    id: string,
    token: string,
    type: TokenType,
    expires: Moment,
    blacklisted: boolean,
  ): Promise<Token>;

  deleteRefreshTokenByUserId(userId: string): Promise<number>;
}
