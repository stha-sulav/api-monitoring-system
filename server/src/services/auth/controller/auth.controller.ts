import { NextFunction, Request, Response } from "express";
import {
  NODE_ENVIRONMENT,
  USER_ROLES,
} from "../../../shared/constants/shared.constant";
import config from "../../../shared/config";
import ApiResponse from "../../../shared/utils/apiResponse";
import { AuthService } from "../service/auth.service";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    if (!authService) {
      throw new Error("Auth service is required");
    }
    this.authService = authService;
  }

  async onboardSuperAdmin(req: Request, res: Response, next: NextFunction) {
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
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: config.node_env === NODE_ENVIRONMENT.production,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
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
}
