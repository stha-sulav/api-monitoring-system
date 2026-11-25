import type { Model } from "mongoose";
import type { CreateDTO, IBaseAuthRepository } from "../auth.types";
import User, {
  type UserDocument,
  type UserType,
} from "../../../shared/database/models/User";
import { USER_ROLES } from "../../../shared/constants/shared.constant";
import logger from "../../../shared/utils/logger";

export class MongoUserRepository implements IBaseAuthRepository<UserType> {
  constructor(private readonly model: Model<UserType>) {}

  async create(userData: CreateDTO<UserType>): Promise<UserDocument> {
    try {
      const data = { ...userData };

      if (data.role === USER_ROLES.SUPER_ADMIN && !data.permissions) {
        data.permissions = {
          canCreateApiKeys: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true,
        };
      }

      const user = new this.model(data);
      const savedUser = await user.save();

      logger.info("User created", {
        username: savedUser.username,
      });

      return savedUser;
    } catch (error) {
      logger.error("Failed to create user", { error });
      throw error;
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      const user = await this.model.findById(id);
      return user;
    } catch (error) {
      logger.error("Failed to find user with Id", { error });
      throw error;
    }
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    try {
      const user = await this.model.findOne({
        username,
      });
      return user;
    } catch (error) {
      logger.error("Failed to find user with username", { error });
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      const user = await this.model.findOne({ email });
      return user;
    } catch (error) {
      logger.error("Failed to find user by email", { error });
      throw error;
    }
  }

  async findAll(): Promise<UserDocument[]> {
    try {
      const users = await this.model
        .find({ isActive: true })
        .select("-password");
      return users;
    } catch (error) {
      logger.error("Failed to find users", { error });
      throw error;
    }
  }
}

export default new MongoUserRepository(User);
