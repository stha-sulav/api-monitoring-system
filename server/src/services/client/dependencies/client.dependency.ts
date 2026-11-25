import userRepository from "../../auth/repository/user.repository";
import { ClientController } from "../controller/clinet.controller";
import apiKeyRepository from "../repository/apikey.repository";
import clientRepository from "../repository/client.repository";
import { ClientService } from "../service/client.service";

export class ClientDependencyContainer {
  static init() {
    const repositories = {
      clientRepository,
      apiKeyRepository,
      userRepository,
    };

    const services = {
      clientService: new ClientService({
        clientRepository: repositories.clientRepository,
        apikeyRepository: repositories.apiKeyRepository,
        userRepository: repositories.userRepository,
      }),
    };

    const controllers = {
      clientController: new ClientController(services.clientService),
    };

    return { repositories, services, controllers };
  }
}

export const clientDependencies = ClientDependencyContainer.init();
