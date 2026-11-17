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
  let statusCode = req.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || null;

  logger.error("Unhandeled Error", {
    message,
    statusCode,
    stack: err.stack,
    path: err.path,
    method: req.method,
  });

  switch (message) {
    case ERRORS.ValidationError:
      statusCode = 400;
      message = "Validation Error";
      errors = Object.values(errors).map((e: any) => e.message);
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
