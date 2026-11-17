import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import ApiResponse from "../utils/apiResponse";

function validate(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      res.status(400).json(
        ApiResponse.validationError({
          error: error.issues ?? error.errors,
          message: "Validation Failed",
          statusCode: 400,
        }),
      );
    }
  };
}

export default validate;
