import { Types } from "mongoose";
import type { QueryFilter } from "mongoose";
import ApiKey, {
  type ApiKeyDocument,
  type ApiKeyModel,
  type ApiKeyType,
  type CreateApiKeyInput,
} from "../../../shared/database/models/ApiKey";
import type {
  ClientIdFilterProps,
  FindByKeyValueProps,
  IBaseApiKeyRepository,
} from "../client.types";
import logger from "../../../shared/utils/logger";

export class MongoApiKeyRepository
  implements IBaseApiKeyRepository<ApiKeyType, CreateApiKeyInput>
{
  constructor(private readonly model: ApiKeyModel) {}

  async create(apiKeyData: CreateApiKeyInput): Promise<ApiKeyDocument> {
    try {
      const apiKey = new this.model(apiKeyData);
      await apiKey.save();

      logger.info("Api key created successfully in DB", {
        keyId: apiKey.keyId,
      });
      return apiKey;
    } catch (error) {
      logger.error("Failed to create Api key", error);
      throw error;
    }
  }

  async findByClientId({
    clientId,
    filters = {},
  }: ClientIdFilterProps<ApiKeyType>): Promise<ApiKeyDocument[]> {
    try {
      const query: QueryFilter<ApiKeyType> = {
        ...filters,
        clientId: new Types.ObjectId(clientId),
      };

      const apiKeys = await this.model
        .find(query)
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 });

      return apiKeys;
    } catch (error) {
      logger.error("Error finding API keys by client ID:", error);
      throw error;
    }
  }

  async findByKeyValue({
    keyValue,
    includeInactive = false,
  }: FindByKeyValueProps): Promise<ApiKeyDocument | null> {
    try {
      const filter: QueryFilter<ApiKeyType> = {
        keyValue,
        ...(includeInactive ? {} : { isActive: true }),
      };

      const apiKey = await this.model.findOne(filter).populate("clientId");
      return apiKey;
    } catch (error) {
      logger.error("Error finding API key by value:", error);
      throw error;
    }
  }

  async countByClientId({
    clientId,
    filters = {},
  }: ClientIdFilterProps<ApiKeyType>): Promise<number> {
    try {
      const query: QueryFilter<ApiKeyType> = {
        ...filters,
        clientId: new Types.ObjectId(clientId),
      };
      const count = await this.model.countDocuments(query);
      return count;
    } catch (error) {
      logger.error("Error counting API keys:", error);
      throw error;
    }
  }
}

export default new MongoApiKeyRepository(ApiKey);
