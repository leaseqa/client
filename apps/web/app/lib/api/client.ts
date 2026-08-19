import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";

import {
  ApiEnvelope,
  ApiEnv,
  ApiError,
  isApiError,
} from "./types";

export { ApiError, isApiError } from "./types";
export type { ApiEnvelope, ApiEnv, ApiErrorBody } from "./types";

const DEFAULT_TIMEOUT_MS = 20_000;

function readPublicOrigin(env: ApiEnv): string {
  return String(env.NEXT_PUBLIC_HTTP_SERVER || "").replace(/\/$/, "");
}

function normalizeApiPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function apiUrl(
  path: string,
  env: ApiEnv = process.env as ApiEnv,
): string {
  const origin = readPublicOrigin(env);
  const prefix = origin ? `${origin}/api` : "/api";
  return `${prefix}${normalizeApiPath(path)}`;
}

export function oauthUrl(
  provider: string,
  env: ApiEnv = process.env as ApiEnv,
): string {
  return apiUrl(`/auth/${provider}`, env);
}

export function unwrapData<T>(response: ApiEnvelope<T> | T): T {
  if ( response && typeof response === "object" && "data" in response ) {
    const envelope = response as ApiEnvelope<T>;
    if ( envelope.data !== undefined ) {
      return envelope.data;
    }
  }
  return response as T;
}

function readErrorBody(data: unknown): { code?: string; message?: string } {
  if ( !data || typeof data !== "object" ) {
    return {};
  }
  const error = (data as ApiEnvelope<unknown>).error;
  if ( !error || typeof error !== "object" ) {
    return {};
  }
  return {
    code: typeof error.code === "string" ? error.code : undefined,
    message: typeof error.message === "string" ? error.message : undefined,
  };
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = toApiError(error).message;
  return message || fallback;
}

export function toApiError(error: unknown): ApiError {
  if ( isApiError(error) ) {
    return error;
  }

  if ( axios.isCancel(error) || (axios.isAxiosError(error) && error.code === "ERR_CANCELED") ) {
    return new ApiError("Request aborted", 0, "ABORTED");
  }

  if ( axios.isAxiosError(error) ) {
    if ( error.code === "ECONNABORTED" ) {
      return new ApiError("Request timed out", 0, "TIMEOUT");
    }

    const status = error.response?.status ?? 0;
    const body = readErrorBody(error.response?.data);
    const message = body.message || error.message || "Request failed";
    const code = body.code || (status ? `HTTP_${status}` : "NETWORK");
    return new ApiError(message, status, code);
  }

  if ( error instanceof Error ) {
    return new ApiError(error.message || "Request failed", 0, "UNKNOWN");
  }

  return new ApiError("Request failed", 0, "UNKNOWN");
}

function attachErrorInterceptor(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(toApiError(error)),
  );
  return instance;
}

export function createApiClient(
  adapter?: AxiosRequestConfig["adapter"],
): AxiosInstance {
  const instance = axios.create({
    withCredentials: true,
    timeout: DEFAULT_TIMEOUT_MS,
    adapter,
  });
  return attachErrorInterceptor(instance);
}

export const apiClient = createApiClient();

export type RequestOptions = {
  signal?: AbortSignal;
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
};

export async function apiGet<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await apiClient.get<T>(apiUrl(path), {
    params: options.params,
    signal: options.signal,
    headers: options.headers,
  });
  return response.data;
}

export async function apiPost<T = any>(
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const response = await apiClient.post<T>(apiUrl(path), body, {
    params: options.params,
    signal: options.signal,
    headers: options.headers,
  });
  return response.data;
}

export async function apiPut<T = any>(
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const response = await apiClient.put<T>(apiUrl(path), body, {
    params: options.params,
    signal: options.signal,
    headers: options.headers,
  });
  return response.data;
}

export async function apiPatch<T = any>(
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const response = await apiClient.patch<T>(apiUrl(path), body, {
    params: options.params,
    signal: options.signal,
    headers: options.headers,
  });
  return response.data;
}

export async function apiDelete<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await apiClient.delete<T>(apiUrl(path), {
    params: options.params,
    signal: options.signal,
    headers: options.headers,
  });
  return response.data;
}
