import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/apiResponse";
import config from "../config";
import { IUserPayload } from "../types/express";
import logger from "../utils/logger";
import { ERRORS } from "../constants/shared.constant";

async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    let token = null;

    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res.status(401).json(
        ApiResponse.error({
          message: "Authentication token is required",
          statusCode: 401,
        }),
      );
    }

    const decoded = jwt.verify(token, config.jwt.secret) as IUserPayload;

    const { userId, email, username, role, clientId } = decoded;

    req.user = { userId, email, username, role, clientId };

    return next();
  } catch (error: any) {
    logger.error("Authentication failed", {
      error: error.message,
      path: req.path,
    });

    if (error.name === ERRORS.TokenExpiredError) {
      return res
        .status(401)
        .json(ApiResponse.error({ message: "Token Expired", statusCode: 401 }));
    }

    return res
      .status(401)
      .json(ApiResponse.error({ message: "Invalid Token", statusCode: 401 }));
  }
}

export default authenticate;
