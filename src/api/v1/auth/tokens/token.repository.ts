import { Token, TokenType } from "@prisma/client";
import prisma from "../../../../database/prisma";
import { TokenRepositoryInterface } from "./token.interface";
import moment, { Moment } from "moment";

class TokenRepository implements TokenRepositoryInterface {
  // This operation save tokens in databes for recognice user
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
}

export default new TokenRepository();
