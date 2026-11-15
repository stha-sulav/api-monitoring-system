import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import errorHandler from "./shared/middleware/errorHandler";
import ApiResponse from "./shared/utils/apiResponse";
import logger from "./shared/utils/logger";

function createApp() {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // logger
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    next();
  });

  app.get("/health", (_req: Request, res: Response) => {
    console.log("Helth endpoint called");
    res.status(200).json(
      ApiResponse.success({
        data: {
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        },
        message: "Server is healthy",
      }),
    );
  });

  app.get("/", (_req: Request, res: Response) => {
    res
      .status(200)
      .json(ApiResponse.success({ message: "Api Monitoring Service" }));
  });

  //   error middlewares
  app.use(errorHandler);

  return app;
}

export default createApp;
