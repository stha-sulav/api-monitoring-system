import type { IncomingMessage, Server, ServerResponse } from "node:http";
import createApp from "./app";
import config from "./shared/config";
import mongodb from "./shared/database/mongodb";
import postgres from "./shared/database/postgres";
import rabbitmq from "./shared/messaging/rabbitmq";
import logger from "./shared/utils/logger";

const app = createApp();

async function initializeConnection() {
  try {
    logger.info("Initializing connections...");

    await mongodb.connect();
    await postgres.testConnection();
    await rabbitmq.connect();

    logger.info("All connection established successfully");
  } catch (error) {
    logger.info("Failed to inilize connection: ", error);
    throw error;
  }
}

async function gracefulShutdown(
  signal: string,
  server: Server<typeof IncomingMessage, typeof ServerResponse>,
) {
  logger.info(`${signal} recieved, shutting down server gracefully...`);

  server.close(async () => {
    logger.info("HTTP seever closed");
    try {
      await mongodb.disconnect();
      await postgres.close();
      await rabbitmq.close();
      process.exit(0);
    } catch (error) {
      logger.error(`Error during shutdown: `, error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("Forced shutdown");
    process.exit(1);
  }, 10000);
}

async function startServer() {
  try {
    await initializeConnection();

    const server = app.listen(config.port, () => {
      logger.info(`Server started on port: ${config.port}`);
      logger.info(`Environment: ${config.node_env}`);
    });

    process.on("SIGTERM", async (signal) => {
      await gracefulShutdown(signal, server);
    });
    process.on("SIGINT", async (signal) => {
      await gracefulShutdown(signal, server);
    });

    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception: ", error);
      gracefulShutdown("uncaughtException", server);
    });

    process.on("unhandledRejection", (error: Error) => {
      logger.error("Unhandled Rejection: ", error);
      gracefulShutdown("unhandledRejection", server);
    });
  } catch (error) {}
}

startServer();
