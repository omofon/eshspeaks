import { API_BASE_URL } from "@/lib/auth/config";
import { tokenStore } from "@/lib/auth/tokenStore";
import { authService } from "@/lib/auth/authService";

const API_PREFIX = "/api/v1";

/**
 * The real response envelope, confirmed live against the deployed backend
 * (curl against GET /api/v1/sections, GET /api/v1/articles/:slug, etc. —
 * not guessed). Every JSON response — success or failure — is wrapped in
 * this shape. `errorCode` is coarse (BAD_REQUEST / UNAUTHORIZED / NOT_FOUND
 * / CONFLICT); the specific machine-readable reason lives in
 * `appErrorCode` (e.g. ARTICLE_NOT_FOUND, OTP_EXPIRED, SECTION_NOT_ASSIGNED)
 * — branch on that, never on `message` text.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode?: string;
  appErrorCode?: string;
  errors?: string[];
  meta?: PaginationMeta;
}

/** Confirmed live shape on every paginated list endpoint (articles, comments/moderation). */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export type ApiErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limited"
  | "server"
  | "unknown";

export class ApiError extends Error {
  kind: ApiErrorKind;
  status: number | undefined;
  /** appErrorCode when present, else the coarse errorCode. */
  code: string | undefined;
  constructor(
    kind: ApiErrorKind,
    message: string,
    opts: { status?: number | undefined; code?: string | undefined } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = opts.status;
    this.code = opts.code;
  }
}

function classify(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate_limited";
  if (status === 400 || status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

function buildError(status: number, body: ApiEnvelope<unknown> | null): ApiError {
  const code = body?.appErrorCode ?? body?.errorCode;
  const message = body?.errors?.[0] ?? body?.message ?? `Request failed (${status}).`;
  return new ApiError(classify(status), message, { status, code });
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function toQueryString(
  query?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!query) return "";
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  retryOn401?: boolean;
  body?: unknown;
  /** Skip JSON.stringify + Content-Type when the caller passes a FormData body directly. */
  raw?: boolean;
};

async function rawFetch(path: string, options: RequestOptions): Promise<Response> {
  if (!API_BASE_URL) throw new ApiError("server", "Backend is not configured.");

  const { auth, retryOn401: _retryOn401, raw, body, headers: extraHeaders, ...init } = options;
  void _retryOn401;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined && !raw ? { "Content-Type": "application/json" } : {}),
    ...((extraHeaders as Record<string, string>) ?? {}),
  };
  const token = auth ? tokenStore.access() : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const finalBody: BodyInit | null =
    body === undefined ? null : raw ? (body as BodyInit) : JSON.stringify(body);

  try {
    return await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
      ...init,
      headers,
      credentials: "include",
      body: finalBody,
    });
  } catch {
    throw new ApiError(
      "network",
      "We couldn't reach EshSpeaks. Check your connection and try again.",
    );
  }
}

/** Unwraps the envelope and returns `data` typed as T. Retries once on 401 via the shared token refresh. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await rawFetch(path, options);

  if (res.status === 401 && options.auth && options.retryOn401 !== false) {
    const refreshed = await authService.refresh();
    if (refreshed) res = await rawFetch(path, { ...options, retryOn401: false });
  }

  const text = await res.text();
  const parsed = text ? (safeJson(text) as ApiEnvelope<T> | null) : null;

  if (!res.ok || parsed?.success === false) {
    throw buildError(res.status, parsed);
  }
  if (!parsed)
    throw new ApiError("server", "EshSpeaks returned an empty response.", { status: res.status });
  return parsed.data;
}

/** Same as apiRequest, but for list endpoints that carry pagination `meta` alongside `data`. */
export async function apiRequestPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Paginated<T>> {
  let res = await rawFetch(path, options);

  if (res.status === 401 && options.auth && options.retryOn401 !== false) {
    const refreshed = await authService.refresh();
    if (refreshed) res = await rawFetch(path, { ...options, retryOn401: false });
  }

  const text = await res.text();
  const parsed = text ? (safeJson(text) as ApiEnvelope<T[]> | null) : null;

  if (!res.ok || parsed?.success === false) {
    throw buildError(res.status, parsed);
  }
  if (!parsed)
    throw new ApiError("server", "EshSpeaks returned an empty response.", { status: res.status });

  return {
    items: Array.isArray(parsed.data) ? parsed.data : [],
    meta: parsed.meta ?? {
      page: 1,
      limit: parsed.data?.length ?? 0,
      total: parsed.data?.length ?? 0,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  };
}
