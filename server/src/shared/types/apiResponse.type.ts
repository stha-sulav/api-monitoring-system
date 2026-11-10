export interface BaseApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface ApiResponseOptions<T = null> {
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface ApiSuccessResponsePayload<T = null> extends BaseApiResponse {
  success: true;
  data: T | null;
}

export interface ApiErrorOptions {
  message?: string;
  statusCode?: number;
  error?: unknown;
}

export interface ApiErrorResponsePayload extends BaseApiResponse {
  success: false;
  error: unknown;
}

export interface ApiPaginatedResponseOptions<T> {
  data?: T[];
  page?: number;
  limit?: number;
  total?: number;
  message?: string;
  statusCode?: number;
}

export interface ApiPaginatedResponsePayload<T> extends BaseApiResponse {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
