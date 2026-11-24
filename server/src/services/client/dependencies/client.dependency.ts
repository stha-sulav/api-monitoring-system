import ApiKey from "../../../shared/database/models/ApiKey";
import Client from "../../../shared/database/models/Client";
import User from "../../../shared/database/models/User";
import { authDependencies } from "../../auth/dependencies/auth.dependency";
import MongoUserRepository from "../../auth/repository/user.repository";
import { ClientController } from "../controller/clinet.controller";
import MongoApiKeyRepository from "../repository/apikey.repository";
import MongoClientRepository from "../repository/client.repository";
import { ClientService } from "../service/client.service";

export class ClientDependencyContainer {
  static init() {
    const repositories = {
      clientRepository: new MongoClientRepository(Client),
      apiKeyRepository: new MongoApiKeyRepository(ApiKey),
      userRepository: new MongoUserRepository(User),
    };

    const services = {
      clientService: new ClientService({
        clientRepository: repositories.clientRepository,
        apikeyRepository: repositories.apiKeyRepository,
        userRepository: repositories.userRepository,
      }),
    };

    const controllers = {
      clientController: new ClientController(
        services.clientService,
        authDependencies.services.authService,
      ),
    };

    return { repositories, services, controllers };
  }
}

export const clientDependencies = ClientDependencyContainer.init();
