import { Token, TokenType } from "@prisma/client";
import { AuthTokenResponseInput } from "./token.validation";
import { Moment } from "moment";

export interface TokenServiceInterface {
  generateAuthToken(id: string): Promise<AuthTokenResponseInput>;
}

export interface TokenRepositoryInterface {
  saveToken(
    id: string,
    token: string,
    type: TokenType,
    expires: Moment,
    blacklisted: boolean,
  ): Promise<Token>;
}
