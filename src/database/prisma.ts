import { PrismaClient } from "@prisma/client";
import { logger } from "../config/logger";

// use a Singleton for PrismaClient to avoid conection problems.
const prisma = new PrismaClient();
// Lista de modelos que soportan soft delete
const SOFT_DELETE_MODELS = [
  "Permission",
  "Role",
  // Añade aquí todos los nombres de tus modelos que tienen isDeleted y deletedAt
];

// 1. Middleware para interceptar DELETES y convertirlos en UPDATES
// src/database/prisma.ts
prisma.$use(async (params, next) => {
  if (params.action === "delete" || params.action === "deleteMany") {
    if (SOFT_DELETE_MODELS.includes(params.model || "")) {
      if (params.action === "delete") {
        params.action = "update";
        params.args.data = {
          ...params.args.data,
          deleted: true,
          deletedAt: new Date(),
        };
      } else if (params.action === "deleteMany") {
        params.action = "updateMany";
        params.args.data = {
          ...params.args.data,
          deleted: true,
          deletedAt: new Date(),
        };
      }
    } else {
      logger.info("Model not in SOFT_DELETE_MODELS:", params.model);
    }
  }
  return next(params);
});

// También puedes agregar logs en el middleware de lectura:
prisma.$use(async (params, next) => {
  if (
    params.action.startsWith("find") &&
    SOFT_DELETE_MODELS.includes(params.model || "")
  ) {
  }
  // Hook for clean disconnect to close application
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
  return next(params);
});

export default prisma;
