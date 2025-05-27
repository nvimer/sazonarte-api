import "dotenv/config";
import { z } from "zod";
import { logger } from "./logger";

// Define el esquema de validación para tus variables de entorno con Zod
const envSchema = z.object({
  PORT: z.string().default("8000"),
  DATABASE_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_SECRET: z.string(), // Añade si planeas usar JWT
  SALT_ROUNDS: z.coerce.number(),
});

// Valida las variables de entorno
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

// Exporta la configuración validada
export const config = {
  port: parseInt(parsedEnv.data.PORT, 10),
  databaseUrl: parsedEnv.data.DATABASE_URL,
  nodeEnv: parsedEnv.data.NODE_ENV,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  saltRounds: parsedEnv.data.SALT_ROUNDS,
};

// Tipado de la configuración
export type AppConfig = typeof config;
