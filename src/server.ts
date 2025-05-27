import app from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import prisma from "./database/prisma";

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("✅ Connected to the database successfully.");

    app.listen(config.port, () =>
      logger.info(
        `🚀 Server running on port ${config.port} in ${config.nodeEnv} mode.`,
      ),
    );
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandler Rejection at: ", promise, "reason: ", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1); // Uncaught exceptions suelen requerir un reinicio del proceso
});

startServer();
