import { ApiErrorOptions } from "../types/apiResponse.type";

export interface AppErrorOptions extends Omit<ApiErrorOptions, "error"> {
  errors?: unknown;
}

class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown;
  public readonly isOperational: boolean;

  constructor({
    message = "Something went wrong",
    statusCode = 500,
    errors = null,
  }: AppErrorOptions = {}) {
    super(message);
    // this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    // Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
