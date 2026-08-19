export type ApiErrorBody = {
  code?: string;
  message?: string;
};

export type ApiEnvelope<T> = {
  data?: T;
  error?: ApiErrorBody;
};

export type ApiEnv = Record<string, string | undefined>;

export class ApiError extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
