import { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "../../../shared/constants/shared.constant";
import config from "../../../shared/config";
import ApiResponse from "../../../shared/utils/apiResponse";
import { AuthService } from "../service/auth.service";
import { UserLoginType, UserRegistrationType } from "../schemas/user.schema";
import { AUTH_TOKEN } from "../auth.constants";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    if (!authService) {
      throw new Error("Auth service is required");
    }
    this.authService = authService;
  }

  async onboardSuperAdmin(
    req: Request<{}, {}, { username: string; email: string; password: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { username, email, password } = req.body;

      const superAdminData = {
        username,
        email,
        password,
        role: USER_ROLES.SUPER_ADMIN,
      };

      const { token, user } =
        await this.authService.onboardSuperAdmin(superAdminData);
      res.cookie(AUTH_TOKEN, token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        maxAge: config.cookie.expiresIn,
      });

      res.status(201).json(
        ApiResponse.success({
          data: user,
          message: "Super admin created successfully",
          statusCode: 201,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async register(
    req: Request<{}, {}, UserRegistrationType>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userData = req.body;

      const { token, user } = await this.authService.register(userData);

      res.cookie(AUTH_TOKEN, token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        maxAge: config.cookie.expiresIn,
      });

      res.status(201).json(
        ApiResponse.success({
          data: user,
          message: "User created successfully",
          statusCode: 201,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request<{}, {}, UserLoginType>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const loginData = req.body;

      const { user, token } = await this.authService.login(loginData);

      res.cookie(AUTH_TOKEN, token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        maxAge: config.cookie.expiresIn,
      });

      res.status(201).json(
        ApiResponse.success({
          data: user,
          message: "User LoggedIn successfully",
          statusCode: 200,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await this.authService.getProfile(userId);

      res.status(200).json(
        ApiResponse.success({
          data: result,
          message: "Profile Fetched Successfully",
          statusCode: 200,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie(AUTH_TOKEN);
      res.status(200).json(
        ApiResponse.success({
          message: "Logout Successfull",
          statusCode: 200,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}
