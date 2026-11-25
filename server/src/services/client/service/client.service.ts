import { Types } from "mongoose";
import { ClientType } from "../../../shared/database/models/Client";
import AppError from "../../../shared/utils/AppError";
import logger from "../../../shared/utils/logger";
import MongoUserRepository from "../../auth/repository/user.repository";
import MongoApiKeyRepository from "../repository/apikey.repository";
import MongoClientRepository from "../repository/client.repository";
import { UserType } from "../../../shared/database/models/User";
import {
  APP_ENVIRONMENT,
  USER_ROLES,
} from "../../../shared/constants/shared.constant";
import SecurityUtils from "../../../shared/utils/security.utils";
import { IUserPayload } from "../../../shared/types/express";

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
  private readonly userRepository: MongoUserRepository;

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
    this.userRepository = dependencies.userRepository;
  }

  private generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  private canUserAccessClient(user: IUserPayload, clientId: string) {
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return true;
    }

    return user.clientId && user.clientId.toString() === clientId;
  }

  private formatClientForResposne(user: UserType) {
    const { password, ...userData } = user;
    return userData;
  }

  async getAllCleints() {
    try {
      const client = await this.clientRepository.find({});
      return client;
    } catch (error) {
      logger.error("Failed to get clients: ", error);
      throw error;
    }
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
      logger.error("Failed to create client: ", error);
      throw error;
    }
  }

  async createClientUser({
    clientId,
    userData,
    data,
  }: {
    clientId: string;
    userData: IUserPayload;
    data: UserType;
  }) {
    try {
      if (!Types.ObjectId.isValid(clientId)) {
        throw new AppError({
          message: "Invalid client id",
          statusCode: 400,
        });
      }

      const client = this.clientRepository.findById(clientId);

      if (!client) {
        throw new AppError({
          message: "Client not found",
          statusCode: 404,
        });
      }

      if (!this.canUserAccessClient(userData, clientId)) {
        throw new AppError({
          message: "Access Denied",
          statusCode: 403,
        });
      }

      if (!data.role) {
        data.role = USER_ROLES.CLINET_VIWER;
      }

      if (!SecurityUtils.isRoleValid(data.role)) {
        throw new AppError({
          message: "Invalid role",
          statusCode: 400,
        });
      }

      data.permissions = {
        canCreateApiKeys: false,
        canManageUsers: false,
        canViewAnalytics: true,
        canExportData: false,
      };

      if (data.role === USER_ROLES.CLIENT_ADMIN) {
        data.permissions = {
          canCreateApiKeys: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true,
        };
      }

      const user = await this.userRepository.create({
        ...data,
        clientId: new Types.ObjectId(clientId),
      });

      logger.info("Client user created", {
        clientId: data.clientId,
        userId: user.id,
        role: data.role,
      });

      return this.formatClientForResposne(user);
    } catch (error) {
      logger.error("Failed to create client user: ", error);
      throw error;
    }
  }

  async createApiKey({
    clientId,
    userData,
    data,
  }: {
    clientId: string;
    userData: IUserPayload;
    data: any;
  }) {
    try {
      if (!Types.ObjectId.isValid(clientId)) {
        throw new AppError({
          message: "Invalid client id",
          statusCode: 400,
        });
      }

      const client = this.clientRepository.findById(clientId);

      if (!client) {
        throw new AppError({
          message: "Client not found",
          statusCode: 404,
        });
      }

      if (!this.canUserAccessClient(userData, clientId)) {
        throw new AppError({
          message: "Access Denied",
          statusCode: 403,
        });
      }

      if (
        !(
          userData.role === USER_ROLES.SUPER_ADMIN ||
          userData.role === USER_ROLES.CLIENT_ADMIN
        )
      ) {
        throw new AppError({
          message: "Access Denied",
          statusCode: 403,
        });
      }

      data.environment ??= APP_ENVIRONMENT.PRODUCTION;
    } catch (error) {
      logger.error("Failed to create APi key: ", error);
      throw error;
    }
  }
}
