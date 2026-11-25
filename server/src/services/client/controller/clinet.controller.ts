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

  async getAllClients(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = await this.authService.checkSuperAdminPermission(
        req.user?.userId!,
      );

      if (!isSuperAdmin) {
        return res
          .status(403)
          .json(
            ApiResponse.error({ message: "Access denied", statusCode: 403 }),
          );
      }

      const clients = await this.clientService.getAllCleints();
      return res.status(200).json(
        ApiResponse.success({
          data: clients,
          statusCode: 200,
        }),
      );
    } catch (error) {
      next(error);
      return;
    }
  }

  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = await this.authService.checkSuperAdminPermission(
        req.user?.userId!,
      );

      if (!isSuperAdmin) {
        return res
          .status(403)
          .json(
            ApiResponse.error({ message: "Access denied", statusCode: 403 }),
          );
      }

      const client = await this.clientService.createClient({
        clientData: req.body,
        userId: req.user?.userId!,
      });

      return res.status(201).json(
        ApiResponse.success({
          message: "Client created successfully",
          statusCode: 201,
          data: client,
        }),
      );
    } catch (error) {
      return next(error);
    }
  }

  async createClientUser(
    req: Request<{ clientId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { clientId } = req.params;

      const user = await this.clientService.createClientUser({
        clientId,
        userData: req.user!,
        data: req.body,
      });

      return res.status(201).json(
        ApiResponse.success({
          data: user,
          message: "Client user created successfully",
          statusCode: 201,
        }),
      );
    } catch (error) {
      return next(error);
    }
  }

  async createApiKey(
    req: Request<{ clientId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { clientId } = req.params;

      const apiKey = await this.clientService.createApiKey({
        clientId,
        userData: req.user!,
        data: req.body,
      });

      return res.status(201).json(
        ApiResponse.success({
          data: apiKey,
          message: "Api key created successfully",
          statusCode: 201,
        }),
      );
    } catch (error) {
      return next(error);
    }
  }
}
