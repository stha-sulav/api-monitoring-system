import { Router } from "express";
import { authDependencies } from "../dependencies/auth.dependency";
import requestLogger from "../../../shared/middleware/requestLogger";
import validate from "../../../shared/middleware/validate";
import {
  loginSchema,
  onboardSuperAdminSchema,
  registrationSchema,
} from "../schemas/user.schema";
import authenticate from "../../../shared/middleware/authenticate";
import authorize from "../../../shared/middleware/authorize";
import { USER_ROLES } from "../../../shared/constants/shared.constant";

const router = Router();
const { controllers } = authDependencies;
const authController = controllers.authController;

router.post(
  "/onboarding-super-admin",
  requestLogger,
  validate(onboardSuperAdminSchema),
  (req, res, next) => authController.onboardSuperAdmin(req, res, next),
);

router.post(
  "/register",
  requestLogger,
  authenticate,
  authorize([USER_ROLES.SUPER_ADMIN]),
  validate(registrationSchema),
  (req, res, next) => authController.register(req, res, next),
);

router.post("/login", requestLogger, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

router.get("/profile", requestLogger, authenticate, (req, res, next) =>
  authController.getProfile(req, res, next),
);

router.get("/logout", authenticate, (req, res, next) =>
  authController.logout(req, res, next),
);

export default router;
