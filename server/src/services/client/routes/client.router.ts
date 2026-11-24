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

export default router;
