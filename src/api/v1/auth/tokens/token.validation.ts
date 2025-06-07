import { TokenType } from "@prisma/client";
import { z } from "zod";

export const tokenValidationSchema = z.object({
  token: z.string(),
  expires: z.string().date(),
});

export const authTokenResponseSchema = z.object({
  access: tokenValidationSchema,
  refresh: tokenValidationSchema,
});

const tokenType = z.enum(
  Object.values(TokenType) as [TokenType, ...TokenType[]],
);

export const payloadSchema = z.object({
  sub: z.string().uuid(),
  iat: z.coerce.number(),
  exp: z.coerce.number(),
  type: tokenType,
});

export type TokenValidationInput = z.infer<typeof tokenValidationSchema>;
export type AuthTokenResponseInput = z.infer<typeof authTokenResponseSchema>;
export type PayloadInput = z.infer<typeof payloadSchema>;
