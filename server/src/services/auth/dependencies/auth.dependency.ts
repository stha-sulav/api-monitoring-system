import { AuthController } from "../controller/auth.controller";
import userRepository from "../repository/user.repository";
import { AuthService } from "../service/auth.service";

export class AuthDependencyContainer {
  static init() {
    const repositories = {
      userRepository,
    };

    const services = {
      authService: new AuthService(repositories.userRepository),
    };

    const controllers = {
      authController: new AuthController(services.authService),
    };

    return {
      repositories,
      services,
      controllers,
    };
  }
}

export const authDependencies = AuthDependencyContainer.init();
