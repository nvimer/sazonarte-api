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

class TokenService implements TokenServiceInterface {
  constructor(private tokenRepository: TokenRepositoryInterface) {}

  // This private functionality can create a token for user authentication. This token have a id, a date of expire, a type and a secret key
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

  // Private method that can save tokens in repository of db. This token is saved in Token model
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

  // This functionality can generate an auth token. This operation uses privates methods for generate acces and refresh token, and save this tokens
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
