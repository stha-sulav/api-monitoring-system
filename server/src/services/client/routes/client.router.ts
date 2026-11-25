import { NextFunction, Request, Response, Router } from "express";
import { clientDependencies } from "../dependencies/client.dependency";
import authenticate from "../../../shared/middleware/authenticate";

const router = Router();

const { clientController } = clientDependencies.controllers;

router.use(authenticate);

router.post(
  "/admin/client/onboard",
  (req: Request, res: Response, next: NextFunction) =>
    clientController.createClient(req, res, next),
);

router.get(
  "/admin/clients",
  (req: Request, res: Response, next: NextFunction) =>
    clientController.getAllClients(req, res, next),
);

router.post(
  "/admin/clients/:clientId/users",
  (req: Request<{ clientId: string }>, res: Response, next: NextFunction) =>
    clientController.createClientUser(req, res, next),
);

router.post(
  "/admin/clients/:clientId/api-keys",
  (req: Request<{ clientId: string }>, res: Response, next: NextFunction) =>
    clientController.createApiKey(req, res, next),
);

export default router;
