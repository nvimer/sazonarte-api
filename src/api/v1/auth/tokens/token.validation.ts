import { TokenType } from "@prisma/client";
import { z } from "zod";

/**
 * Token validation schema for individual token objects
 *
 * Validates the structure of individual tokens including
 * the token string and expiration date.
 *
 * Validation Rules:
 * - token: Must be a non-empty string
 * - expires: Must be a valid date string
 *
 * Use Cases:
 * - Access token validation
 * - Refresh token validation
 * - Token response structure validation
 */
export const tokenValidationSchema = z.object({
  token: z.string(),
  expires: z.string().date(),
});

/**
 * Authentication token response schema
 *
 * Validates the complete authentication token response structure
 * that includes both access and refresh tokens.
 *
 * Validation Rules:
 * - access: Must be a valid token object
 * - refresh: Must be a valid token object
 *
 * Response Structure:
 * - access: Short-lived token for API authentication
 * - refresh: Long-lived token for session renewal
 *
 * Use Cases:
 * - Login response validation
 * - Token pair generation validation
 * - Authentication response structure
 */
export const authTokenResponseSchema = z.object({
  access: tokenValidationSchema,
  refresh: tokenValidationSchema,
});

/**
 * Token type enumeration validation
 *
 * Creates a Zod enum from the Prisma TokenType enum
 * to ensure only valid token types are accepted.
 *
 * Valid Token Types:
 * - ACCESS: Short-lived token for API access
 * - REFRESH: Long-lived token for session renewal
 *
 * Use Cases:
 * - Token type validation in payloads
 * - JWT payload structure validation
 * - Token creation type validation
 */
const tokenType = z.enum(
  Object.values(TokenType) as [TokenType, ...TokenType[]],
);

/**
 * JWT payload validation schema
 *
 * Validates the structure of JWT token payloads to ensure
 * they contain all required fields with proper types.
 *
 * Validation Rules:
 * - sub: Must be a valid UUID string (user ID)
 * - iat: Must be a number (issued at timestamp)
 * - exp: Must be a number (expiration timestamp)
 * - type: Must be a valid token type (ACCESS/REFRESH)
 *
 * JWT Payload Structure:
 * - sub: Subject (user ID)
 * - iat: Issued at (Unix timestamp)
 * - exp: Expiration (Unix timestamp)
 * - type: Token type for validation
 *
 * Security Features:
 * - UUID validation for user ID
 * - Timestamp validation for token lifecycle
 * - Token type validation for security
 * - JWT standard compliance
 *
 * Use Cases:
 * - JWT token payload validation
 * - Token verification and parsing
 * - Security token validation
 * - Authentication middleware
 */
export const payloadSchema = z.object({
  sub: z.string().uuid(),
  iat: z.coerce.number(),
  exp: z.coerce.number(),
  type: tokenType,
});

/**
 * TypeScript type for token validation input
 *
 * Inferred from tokenValidationSchema, this type provides
 * TypeScript type safety for individual token objects.
 *
 * Type Structure:
 * - token: string - JWT token string
 * - expires: string - Token expiration date string
 */
export type TokenValidationInput = z.infer<typeof tokenValidationSchema>;

/**
 * Type Structure:
 * - access: TokenValidationInput - Access token with expiration
 * - refresh: TokenValidationInput - Refresh token with expiration
 */
export type AuthTokenResponseInput = z.infer<typeof authTokenResponseSchema>;

/**
 * Type Structure:
 * - sub: string - User ID (UUID)
 * - iat: number - Issued at timestamp
 * - exp: number - Expiration timestamp
 * - type: TokenType - Token type (ACCESS/REFRESH)
 */
export type PayloadInput = z.infer<typeof payloadSchema>;
