import { Types } from "mongoose";
import { ClientType } from "../../../shared/database/models/Client";
import AppError from "../../../shared/utils/AppError";
import logger from "../../../shared/utils/logger";
import MongoUserRepository from "../../auth/repository/user.repository";
import MongoApiKeyRepository from "../repository/apikey.repository";
import MongoClientRepository from "../repository/client.repository";

export type ClientServiceDependencies = {
  clientRepository: MongoClientRepository;
  apikeyRepository: MongoApiKeyRepository;
  userRepository: MongoUserRepository;
};

/**
 * Input accepted by `createClient`.
 * `slug` is generated from the name and `createdBy` is derived from `userId`,
 * so callers must not provide them.
 */
export type CreateClientInput = Omit<
  ClientType,
  "slug" | "createdBy" | "createdAt" | "updatedAt"
>;

export class ClientService {
  private readonly clientRepository: MongoClientRepository;

  constructor(dependencies: ClientServiceDependencies) {
    if (!dependencies) {
      throw new Error("Dependencies are required");
    }

    if (!dependencies.clientRepository) {
      throw new Error("Client repository dependencies are required");
    }

    if (!dependencies.apikeyRepository) {
      throw new Error("ApkkeyRepository is required");
    }

    if (!dependencies.userRepository) {
      throw new Error("UserRepository is required");
    }

    this.clientRepository = dependencies.clientRepository;
  }

  private generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async createClient({
    clientData,
    userId,
  }: {
    clientData: CreateClientInput;
    userId: string;
  }) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError({
          message: "Invalid user id",
          statusCode: 400,
        });
      }

      const { name } = clientData;

      const slug = this.generateSlug(name);

      const existingClient = await this.clientRepository.findBySlug(slug);

      if (existingClient) {
        throw new AppError({
          message: `Client with slug ${slug} already exists`,
          statusCode: 400,
        });
      }

      const newclient = await this.clientRepository.create({
        ...clientData,
        slug,
        createdBy: new Types.ObjectId(userId),
      });

      return newclient;
    } catch (error) {
      logger.error("Fialed to crate client: ", error);
      throw error;
    }
  }
}
