import {
  ApiResponseOptions,
  ApiSuccessResponsePayload,
  ApiErrorOptions,
  ApiErrorResponsePayload,
  ApiPaginatedResponseOptions,
  ApiPaginatedResponsePayload,
} from "../types/apiResponse.type";

class ApiResponse {
  static success<T = null>({
    data,
    message = "Success",
    statusCode = 200,
  }: ApiResponseOptions<T> = {}): ApiSuccessResponsePayload<T> {
    return {
      success: true,
      message,
      data: data ?? null,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static error({
    message = "Internal server error",
    statusCode = 500,
    error = null,
  }: ApiErrorOptions = {}): ApiErrorResponsePayload {
    const serializedError =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : error;

    return {
      success: false,
      message,
      error: serializedError,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static validationError({
    message = "Validation failed",
    statusCode = 400,
    error = null,
  }: ApiErrorOptions = {}): ApiErrorResponsePayload {
    return this.error({ message, statusCode, error });
  }

  static paginated<T>({
    data = [],
    page = 1,
    limit = 10,
    total = 0,
    message = "Success",
    statusCode = 200,
  }: ApiPaginatedResponseOptions<T> = {}): ApiPaginatedResponsePayload<T> {
    const safeLimit = Math.max(1, limit);
    const totalPages = Math.ceil(total / safeLimit);

    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

export default ApiResponse;
