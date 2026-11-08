import mongoose, { type Connection } from "mongoose";

import config from "../config/index";
import logger from "../utils/logger";

class MongoConnection {
  private connection: Connection = mongoose.connection;

  private connectionPromise: Promise<Connection> | null = null;

  constructor() {
    this.registerListeners();
  }

  /**
   * Register MongoDB lifecycle event listeners.
   */
  private registerListeners(): void {
    this.connection.on("connected", () => {
      logger.info("MongoDB connected successfully");
    });

    this.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    this.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected successfully");
    });

    this.connection.on("error", (error: Error) => {
      logger.error("MongoDB connection error", error);
    });
  }

  /**
   * Establish MongoDB connection.
   * Concurrent calls share the same connection promise.
   */
  async connect(): Promise<Connection> {
    // Already connected.
    if (this.connection.readyState === 1) {
      return this.connection;
    }

    // Connection attempt already in progress.
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = mongoose
      .connect(config.mongo.uri, {
        dbName: config.mongo.dbName,
      })
      .then(() => {
        logger.info("MongoDB connection established");

        return this.connection;
      })
      .catch((error: unknown) => {
        logger.error("Failed to connect to MongoDB", error);

        throw error;
      })
      .finally(() => {
        this.connectionPromise = null;
      });

    return this.connectionPromise;
  }

  /**
   * Disconnect from MongoDB.
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connectionPromise) {
        await this.connectionPromise;
      }

      if (this.connection.readyState === 0) {
        return;
      }

      await mongoose.disconnect();

      logger.info("MongoDB disconnected successfully");
    } catch (error) {
      logger.error("Failed to disconnect MongoDB", error);

      throw error;
    }
  }

  /**
   * Get the active MongoDB connection.
   */
  getConnection(): Connection {
    if (this.connection.readyState !== 1) {
      throw new Error("MongoDB is not connected");
    }

    return this.connection;
  }
}

export default new MongoConnection();
