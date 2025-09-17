import { PrismaClient } from "@prisma/client";
import { logger } from "../config/logger";

// Tipos para soft delete
type SoftDeleteModel = {
  deleted: boolean;
  deletedAt: Date | null;
};

// Tipo para los parámetros de query de Prisma
type PrismaQueryParams = {
  model: string;
  operation: string;
  args: Record<string, any>;
  query: (args: Record<string, any>) => Promise<any>;
};

// Lista de modelos que soportan soft delete
const SOFT_DELETE_MODELS = [
  "Permission",
  "Role",
  "MenuCategory",
  "MenuItem",
  "User",
  "Table",
] as const;

type SoftDeleteModelName = (typeof SOFT_DELETE_MODELS)[number];

// Función helper para crear soft delete handlers con tipos estrictos
const createSoftDeleteHandlers = (modelName: SoftDeleteModelName) => ({
  async delete({ model, operation, args, query }: PrismaQueryParams) {
    logger.info(`Soft deleting ${modelName} with ID: ${args.where?.id}`);
    return query({
      ...args,
      data: { ...args.data, deleted: true, deletedAt: new Date() },
    });
  },

  async deleteMany({ model, operation, args, query }: PrismaQueryParams) {
    logger.info(`Soft deleting multiple ${modelName}s`);
    return query({
      ...args,
      data: { ...args.data, deleted: true, deletedAt: new Date() },
    });
  },

  async findMany({ model, operation, args, query }: PrismaQueryParams) {
    const where = args.where || {};
    return query({
      ...args,
      where: { ...where, deleted: false },
    });
  },

  async findFirst({ model, operation, args, query }: PrismaQueryParams) {
    const where = args.where || {};
    return query({
      ...args,
      where: { ...where, deleted: false },
    });
  },

  async findUnique({ model, operation, args, query }: PrismaQueryParams) {
    const where = args.where || {};
    return query({
      ...args,
      where: { ...where, deleted: false },
    });
  },
});

// Crear PrismaClient con extensiones para soft delete
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
}).$extends({
  query: {
    // MenuCategory soft delete
    menuCategory: createSoftDeleteHandlers("MenuCategory"),
    // MenuItem soft delete
    menuItem: createSoftDeleteHandlers("MenuItem"),
    // Permission soft delete
    permission: createSoftDeleteHandlers("Permission"),
    // Role soft delete
    role: createSoftDeleteHandlers("Role"),
    // User soft delete
    user: createSoftDeleteHandlers("User"),
    // Table soft delete
    table: createSoftDeleteHandlers("Table"),
  },
});

// Hook for clean disconnect to close application
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
