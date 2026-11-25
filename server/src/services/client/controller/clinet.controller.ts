import { NextFunction, Request, Response } from "express";
import { ClientService } from "../service/client.service";
import ApiResponse from "../../../shared/utils/apiResponse";

export class ClientController {
  private readonly clientService: ClientService;

  constructor(clientService: ClientService) {
    if (!clientService) {
      throw new Error("ClientService is required");
    }

    this.clientService = clientService;
  }

  async getAllClients(_req: Request, res: Response, next: NextFunction) {
    try {
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

  async getApiKey(
    req: Request<{ clientId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { clientId } = req.params;

      const apiKey = await this.clientService.getApiKey({
        clientId,
        userData: req.user!,
      });

      return res.status(200).json(
        ApiResponse.success({
          data: apiKey,
          message: "Api key fetched successfully",
          statusCode: 201,
        }),
      );
    } catch (error) {
      return next(error);
    }
  }
}
