import "dotenv/config";
import { z } from "zod";
import { logger } from "./logger";

const envSchema = z.object({
  PORT: z.string().default("8080"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_URL: z.string(),
  DATABASE_URL: z.string(),
  TEST_DATABASE_URL: z.string(),
  JWT_SECRET: z.string(), // Añade si planeas usar JWT
  SALT_ROUNDS: z.coerce.number(),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number(),
  JWT_ACCESS_EXPIRATION_DAYS: z.coerce.number(),
  ALLOWED_ORIGINS: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

export const config = {
  port: parseInt(parsedEnv.data.PORT, 10),
  nodeEnv: parsedEnv.data.NODE_ENV,
  appUrl: parsedEnv.data.APP_URL,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  testDatabaseUrl: parsedEnv.data.TEST_DATABASE_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  saltRounds: parsedEnv.data.SALT_ROUNDS,
  jwtAccessExpirationMinutes: parsedEnv.data.JWT_ACCESS_EXPIRATION_MINUTES,
  jwtAccessExpirationDays: parsedEnv.data.JWT_ACCESS_EXPIRATION_DAYS,
  allowedOrigins: parsedEnv.data.ALLOWED_ORIGINS,
};

export type AppConfig = typeof config;
