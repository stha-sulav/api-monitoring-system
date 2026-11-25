import { NextFunction, Request, Response, Router } from "express";
import { clientDependencies } from "../dependencies/client.dependency";
import authenticate from "../../../shared/middleware/authenticate";
import authorize from "../../../shared/middleware/authorize";
import { USER_ROLES } from "../../../shared/constants/shared.constant";

const router = Router();

const { clientController } = clientDependencies.controllers;

router.use(authenticate);

router.post(
  "/admin/client/onboard",
  authorize([USER_ROLES.SUPER_ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    clientController.createClient(req, res, next),
);

router.get(
  "/admin/clients",
  authorize([USER_ROLES.SUPER_ADMIN]),
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

router.get(
  "/admin/clients/:clientId/api-keys",
  (req: Request<{ clientId: string }>, res: Response, next: NextFunction) =>
    clientController.getApiKey(req, res, next),
);

export default router;
