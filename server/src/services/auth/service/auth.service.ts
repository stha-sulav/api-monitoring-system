import jwt, { SignOptions } from "jsonwebtoken";
import { UserType } from "../../../shared/database/models/User";
import AppError from "../../../shared/utils/AppError";
import config from "../../../shared/config";
import logger from "../../../shared/utils/logger";
import MongoUserRepository from "../repository/user.repository";

export class AuthService {
  private userRepository: MongoUserRepository;

  constructor(userRepository: MongoUserRepository) {
    if (!userRepository) {
      throw new Error("User repository is required");
    }
    this.userRepository = userRepository;
  }

  private generateToken(user: UserType) {
    const { _id, email, username, role, clientId } = user;

    const payload = {
      userId: _id,
      email,
      username,
      role,
      clientId,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
    });
  }

  formatUserResponse(user: UserType) {
    const { password, ...cleanUserObj } = user;
    return cleanUserObj;
  }

  async onboardSuperAdmin(superAdminData: any) {
    try {
      const existingUser = await this.userRepository.findAll();

      if (existingUser && existingUser.length > 0) {
        throw new AppError({
          message: "Super admin onboarding is disabled",
          statusCode: 403,
        });
      }

      const user = await this.userRepository.create(superAdminData);
      const token = this.generateToken(user);

      logger.info("Admin onBoarded successfully", {
        username: user.username,
      });

      return { user: this.formatUserResponse(user), token };
    } catch (error) {
      logger.error("Error onboarding Super Admin", error);
      throw error;
    }
  }
}
