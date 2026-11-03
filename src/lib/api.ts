export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api/v1";

export interface ApiFieldError { field: string; message: string; type?: string; }
export interface ApiResponse<T> { success: boolean; status_code: number; message: string; data?: T; errors?: ApiFieldError[]; }

export class ApiError extends Error {
  readonly statusCode: number;
  readonly fieldErrors: ApiFieldError[];
  constructor(response: ApiResponse<unknown>) {
    super(response.message);
    this.name = "ApiError";
    this.statusCode = response.status_code;
    this.fieldErrors = response.errors ?? [];
  }
}

export interface RequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: HeadersInit;
  accessToken?: string;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.success === "boolean" && typeof candidate.status_code === "number" && typeof candidate.message === "string";
}

async function readResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let body: unknown;
  try { body = await response.json(); } catch {
    throw new ApiError({ success: false, status_code: response.status, message: "The server returned an invalid response." });
  }
  if (!isApiResponse<T>(body)) {
    throw new ApiError({ success: false, status_code: response.status, message: "The server returned an unexpected response." });
  }
  if (!response.ok || !body.success) throw new ApiError(body);
  return body;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  const { accessToken, body, headers, ...requestOptions } = options;
  const isMultipart = body instanceof FormData;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: {
        ...(isMultipart ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body === undefined || isMultipart ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError({ success: false, status_code: 0, message: "Unable to reach the server. Check your connection and try again." });
  }
  const envelope = await readResponse<T>(response);
  return envelope.data as T;
}

export interface Page<T> { items: T[]; total: number; page: number; page_size: number; }

export function withQuery(path: string, params: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function errorMessage(cause: unknown, fallback: string) {
  if (!(cause instanceof ApiError)) return fallback;
  const details = cause.fieldErrors.map((error) => error.message).join(" ");
  return details ? `${cause.message} ${details}` : cause.message;
}
