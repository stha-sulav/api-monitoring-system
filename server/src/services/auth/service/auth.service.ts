import jwt, { type SignOptions } from "jsonwebtoken";
import type {
  UserDocument,
  UserType,
} from "../../../shared/database/models/User";
import AppError from "../../../shared/utils/AppError";
import config from "../../../shared/config";
import logger from "../../../shared/utils/logger";
import type { UserLoginType, UserRegistrationType } from "../schemas/user.schema";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../../../shared/constants/shared.constant";
import type {
  CreateDTO,
  IBaseAuthRepository,
  JwtPayload,
  UserResponse,
} from "../auth.types";

export class AuthService {
  private readonly userRepository: IBaseAuthRepository<UserType>;

  constructor(userRepository: IBaseAuthRepository<UserType>) {
    if (!userRepository) {
      throw new Error("User repository is required");
    }
    this.userRepository = userRepository;
  }

  private generateToken(user: UserDocument) {
    const { _id, email, username, role, clientId } = user;

    const payload: JwtPayload = {
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

  private formatUserResponse(user: UserDocument): UserResponse {
    const { password: _password, ...cleanUserObj } = user.toObject();
    return cleanUserObj;
  }

  private async comparePassword(
    enteredPassword: string,
    hashedPassword: string,
  ) {
    return bcrypt.compare(enteredPassword, hashedPassword);
  }

  async onboardSuperAdmin(superAdminData: CreateDTO<UserType>) {
    try {
      const existingUsers = await this.userRepository.findAll();

      if (existingUsers && existingUsers.length > 0) {
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

  async checkSuperAdminPermission(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new AppError({ message: "User Not Found", statusCode: 404 });
      }

      return user.role === USER_ROLES.SUPER_ADMIN;
    } catch (error) {
      logger.error("Error checking super admin: ", error);
      throw error;
    }
  }

  async register(userData: UserRegistrationType) {
    try {
      const existingUsername = await this.userRepository.findByUsername(
        userData.username,
      );

      if (existingUsername) {
        throw new AppError({
          message: "User with the username already exists.",
          statusCode: 409,
        });
      }

      const existingEmail = await this.userRepository.findByEmail(
        userData.email,
      );

      if (existingEmail) {
        throw new AppError({
          message: "User with the email already exists.",
          statusCode: 409,
        });
      }

      const user = await this.userRepository.create(userData);
      const token = this.generateToken(user);

      logger.info("User created successfully", {
        username: user.username,
      });

      return { user: this.formatUserResponse(user), token };
    } catch (error) {
      logger.error("Error while creating User", error);
      throw error;
    }
  }

  async login(loginData: UserLoginType) {
    try {
      const user = await this.userRepository.findByUsername(loginData.username);

      if (!user) {
        throw new AppError({
          message: "Invalid username or password.",
          statusCode: 401,
        });
      }

      if (!user.isActive) {
        throw new AppError({
          message: "Account is not active.",
          statusCode: 403,
        });
      }

      const isPasswordValid = await this.comparePassword(
        loginData.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new AppError({
          message: "Invalid username or password.",
          statusCode: 401,
        });
      }

      const token = this.generateToken(user);

      logger.info("User login successfully", {
        username: user.username,
      });

      return { user: this.formatUserResponse(user), token };
    } catch (error) {
      logger.error("Error while logging user in", error);
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new AppError({ message: "User donot exists", statusCode: 404 });
      }

      return this.formatUserResponse(user);
    } catch (error) {
      logger.error("Error while fetching user profile", error);
      throw error;
    }
  }
}
