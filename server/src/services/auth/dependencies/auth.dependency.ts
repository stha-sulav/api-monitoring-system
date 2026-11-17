import User from "../../../shared/database/models/User";
import { AuthController } from "../controller/auth.controller";
import MongoUserRepository from "../repository/user.repository";
import { AuthService } from "../service/auth.service";

export class AuthDependencyContainer {
  static init() {
    const repositories = {
      userRepository: new MongoUserRepository(User),
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
