import { PrismaClient } from "@prisma/client";

// use a Singleton for PrismaClient to avoid conection problems.
const prisma = new PrismaClient();

// Hook for clean disconnect to close application
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
