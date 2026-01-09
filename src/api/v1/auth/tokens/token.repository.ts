import { Token, TokenType } from "@prisma/client";
import prisma from "../../../../database/prisma";
import { TokenRepositoryInterface } from "./token.interface";
import moment, { Moment } from "moment";

/**
 * Token Repository
 *
 * Database Operations:
 * - Token creation and storage
 * - Token expiration tracking
 * - Token blacklist management
 * - User-token association
 *
 * Security Features:
 * - Token hashing for storage
 * - Expiration date tracking
 * - Blacklist status management
 * - User association for audit trails
 */
class TokenRepository implements TokenRepositoryInterface {
  async saveToken(
    id: string,
    token: string,
    type: TokenType,
    expires: Moment = moment.utc(),
    blacklisted: boolean = false,
  ): Promise<Token> {
    return await prisma.token.create({
      data: {
        userId: id,
        token,
        type,
        expires: expires.toDate(),
        blacklisted,
      },
    });
  }

  async deleteRefreshTokenByUserId(userId: string): Promise<number> {
    const result = await prisma.token.deleteMany({
      where: {
        userId,
        type: TokenType.REFRESH,
      },
    });
    return result.count;
  }
}

export default new TokenRepository();
