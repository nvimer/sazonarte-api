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
