import amqp, { type Channel, type ChannelModel } from "amqplib";

import config from "../config/index";
import logger from "../utils/logger";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "closing";

class RabbitMQConnection {
  private connection: ChannelModel | null = null;

  private channel: Channel | null = null;

  private connectionPromise: Promise<Channel> | null = null;

  private status: ConnectionStatus = "disconnected";

  /**
   * Establish RabbitMQ connection and create channel.
   * Concurrent calls share the same Promise.
   */
  connect(): Promise<Channel> {
    // Already connected.
    if (this.channel) {
      return Promise.resolve(this.channel);
    }

    // Connection attempt already running.
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.status = "connecting";

    this.connectionPromise = this.createConnection()
      .catch((error: unknown) => {
        this.status = "disconnected";

        logger.error("Failed to connect to RabbitMQ", error);

        throw error;
      })
      .finally(() => {
        this.connectionPromise = null;
      });

    return this.connectionPromise;
  }

  /**
   * Create connection, channel and queues.
   */
  private async createConnection(): Promise<Channel> {
    try {
      logger.info("Connecting to RabbitMQ");

      const connection = await amqp.connect(config.rabbitmq.url);

      this.connection = connection;

      // Register connection listeners.
      connection.on("error", (error: Error) => {
        logger.error("RabbitMQ connection error", error);
      });

      connection.on("close", () => {
        logger.warn("RabbitMQ connection closed");

        this.connection = null;
        this.channel = null;
        this.status = "disconnected";
      });

      const channel = await connection.createChannel();

      this.channel = channel;

      // Register channel listeners.
      channel.on("error", (error: Error) => {
        logger.error("RabbitMQ channel error", error);
      });

      channel.on("close", () => {
        logger.warn("RabbitMQ channel closed");

        this.channel = null;

        if (this.status !== "closing") {
          this.status = "disconnected";
        }
      });

      // Declare dead-letter queue.
      const dlqName = `${config.rabbitmq.queue}.dlq`;

      await channel.assertQueue(dlqName, {
        durable: true,
      });

      // Declare main queue.
      await channel.assertQueue(config.rabbitmq.queue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": dlqName,
        },
      });

      this.status = "connected";

      logger.info(
        `RabbitMQ connected successfully. Queue: ${config.rabbitmq.queue}`,
      );

      return channel;
    } catch (error) {
      // Clean up partially initialized resources.
      await this.cleanup();

      throw error;
    }
  }

  /**
   * Get an active RabbitMQ channel.
   */
  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not initialized");
    }

    return this.channel;
  }

  /**
   * Get connection status.
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Clean up connection resources.
   */
  private async cleanup(): Promise<void> {
    const channel = this.channel;
    const connection = this.connection;

    this.channel = null;
    this.connection = null;

    try {
      await channel?.close();
    } catch {
      // Channel may already be closed.
    }

    try {
      await connection?.close();
    } catch {
      // Connection may already be closed.
    }
  }

  /**
   * Gracefully close RabbitMQ.
   */
  async close(): Promise<void> {
    if (this.status === "disconnected" && !this.connection) {
      return;
    }

    this.status = "closing";

    try {
      // Wait for an ongoing connection attempt.
      if (this.connectionPromise) {
        await this.connectionPromise.catch(() => undefined);
      }

      await this.cleanup();

      this.status = "disconnected";

      logger.info("RabbitMQ connection closed successfully");
    } catch (error) {
      this.status = "disconnected";

      logger.error("Failed to close RabbitMQ", error);

      throw error;
    }
  }
}

export default new RabbitMQConnection();
