import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../auth/service/auth.service";
import { ClientService } from "../service/client.service";
import ApiResponse from "../../../shared/utils/apiResponse";

export class ClientController {
  private readonly clientService: ClientService;
  private readonly authService: AuthService;

  constructor(clientService: ClientService, authService: AuthService) {
    if (!clientService) {
      throw new Error("ClientService is required");
    }

    if (!authService) {
      throw new Error("AuthService is required");
    }

    this.clientService = clientService;
    this.authService = authService;
  }

  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = await this.authService.checkSuperAdminPermission(
        req.user?.userId ?? "",
      );

      if (!isSuperAdmin) {
        return res
          .status(403)
          .json(
            ApiResponse.error({ message: "Access denied", statusCode: 403 }),
          );
      }

      await this.clientService.createClient({
        clientData: req.body,
        userId: req.user?.userId!,
      });

      return res.status(201).json(
        ApiResponse.success({
          message: "Client created successfully",
          statusCode: 201,
        }),
      );
    } catch (error) {
      return next(error);
    }
  }
}
