import { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "../constants/shared.constant";
import ApiResponse from "../utils/apiResponse";

function authorize(allowedRoles: USER_ROLES[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.role) {
        return res
          .status(403)
          .json(ApiResponse.error({ message: "Forbidden", statusCode: 403 }));
      }

      if (allowedRoles.length === 0) {
        return next();
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json(
          ApiResponse.error({
            message: "Insufficient permission",
            statusCode: 403,
          }),
        );
      }
      return next();
    } catch (error) {
      return res
        .status(403)
        .json(ApiResponse.error({ message: "Forbidden", statusCode: 403 }));
    }
  };
}

export default authorize;
