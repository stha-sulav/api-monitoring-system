import type { NextFunction, Request, Response } from "express";
import ApiResponse from "../utils/apiResponse";
import logger from "../utils/logger";
import { ERRORS } from "../constants/shared.constant";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode: number = err.statusCode ?? 500;
  let message: string = err.message || "Internal server error";
  let errors = err.errors ?? null;

  logger.error("Unhandled Error", {
    message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  switch (err.name) {
    case ERRORS.ValidationError:
      statusCode = 400;
      message = "Validation Error";
      if (errors) {
        errors = Object.values(errors).map((e: any) => e.message);
      }
      break;
    case ERRORS.MongoServerError:
      if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate Key Error";
      }
      break;
    case ERRORS.JsonWebTokenError:
      statusCode = 401;
      message = "Invalid Token";
      break;
    case ERRORS.TokenExpiredError:
      statusCode = 401;
      message = "Token Expired";
      break;
  }

  res
    .status(statusCode)
    .json(ApiResponse.error({ message, statusCode, error: errors }));
}

export default errorHandler;
