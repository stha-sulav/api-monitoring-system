import { Router } from "express";
import { authDependencies } from "../dependencies/auth.dependency";
import requestLogger from "../../../shared/middleware/requestLogger";
import validate from "../../../shared/middleware/validate";
import { onboardSuperAdminSchema } from "../schemas/user.schema";

const router = Router();
const { controllers } = authDependencies;
const authController = controllers.authController;

router.post(
  "/onboarding-super-admin",
  requestLogger,
  validate(onboardSuperAdminSchema),
  (req, res, next) => authController.onboardSuperAdmin(req, res, next),
);

export default router;
