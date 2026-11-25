import type { Model, QueryFilter } from "mongoose";
import Client, {
  type ClientDocument,
  type ClientType,
} from "../../../shared/database/models/Client";
import type { ClientFindOptions, IBaseClientRepository } from "../client.types";
import logger from "../../../shared/utils/logger";

export class MongoClientRepository implements IBaseClientRepository<ClientType> {
  constructor(private readonly model: Model<ClientType>) {}

  async create(
    clientData: Omit<ClientType, "createdAt" | "updatedAt">,
  ): Promise<ClientDocument> {
    try {
      const client = new this.model(clientData);
      await client.save();

      logger.info("Client created in MongoDB", {
        mongoId: client._id,
        slug: client.slug,
      });

      return client;
    } catch (error) {
      logger.error("Failed to create Clinet", error);
      throw error;
    }
  }

  async findById(clientId: string): Promise<ClientDocument | null> {
    try {
      const client = await this.model.findById(clientId);

      logger.info("Client Details: ", client);

      return client;
    } catch (error) {
      logger.error("Failed to find Client by its Id", error);
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<ClientDocument | null> {
    try {
      const client = await this.model.findOne({ slug });

      logger.info("Client Details: ", client);

      return client;
    } catch (error) {
      logger.error("Failed to find Client by its slug", error);
      throw error;
    }
  }

  async find(
    filters: QueryFilter<ClientType> = {},
    options: ClientFindOptions = {},
  ): Promise<ClientDocument[]> {
    try {
      const limit = options.limit ?? 50;
      const skip = options.skip ?? 0;
      const sort: Record<string, 1 | -1> = options.sort ?? { createdAt: -1 };

      const clients = await this.model
        .find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-__v");

      logger.info("Client Details: ", clients);

      return clients;
    } catch (error) {
      logger.error("Failed to find Clients", error);
      throw error;
    }
  }

  async count(filters: QueryFilter<ClientType> = {}): Promise<number> {
    try {
      const count = await this.model.countDocuments(filters);

      return count;
    } catch (error) {
      logger.error("Failed to count Clients", error);
      throw error;
    }
  }
}

export default new MongoClientRepository(Client);
