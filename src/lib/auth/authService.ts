import { API_BASE_URL } from "./config";

export type AuthErrorKind =
  | "network"
  | "invalid_email"
  | "invalid_code"
  | "expired_code"
  | "attempts_exceeded"
  | "rate_limited"
  | "unauthorized"
  | "account_disabled"
  | "invalid_username"
  | "username_taken"
  | "server"
  | "unknown";

export class AuthError extends Error {
  kind: AuthErrorKind;
  status?: number;
  code?: string;
  /** seconds to wait, when the API supplies Retry-After */
  retryAfter?: number;
  constructor(kind: AuthErrorKind, message: string, opts: { status?: number; code?: string; retryAfter?: number } = {}) {
    super(message);
    this.name = "AuthError";
    this.kind = kind;
    this.status = opts.status;
    this.code = opts.code;
    this.retryAfter = opts.retryAfter;
  }
}

export type CurrentUser = {
  id: string;
  email: string;
  username: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
};

export type AuthSession = {
  user: CurrentUser;
  accessToken?: string;
  refreshToken?: string;
  /** true when the account still needs to pick a username */
  onboardingRequired: boolean;
};

const API_PREFIX = "/api/v1";
const ACCESS_KEY = "esh.accessToken";
const REFRESH_KEY = "esh.refreshToken";

/* ------------------------------------------------------------------ tokens */
/**
 * The API sets HttpOnly session cookies for browsers; tokens are only kept
 * here as a fallback for clients that receive them in the JSON body
 * (e.g. cross-origin API host without cookie support).
 */
export const tokenStore = {
  access: () => (typeof window === "undefined" ? null : window.localStorage.getItem(ACCESS_KEY)),
  refresh: () => (typeof window === "undefined" ? null : window.localStorage.getItem(REFRESH_KEY)),
  set(tokens: { accessToken?: string | null; refreshToken?: string | null }) {
    if (typeof window === "undefined") return;
    if (tokens.accessToken) window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    if (tokens.refreshToken) window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

/* ------------------------------------------------------------------ errors */
const MESSAGES: Record<string, [AuthErrorKind, string]> = {
  RATE_LIMIT_EXCEEDED: ["rate_limited", "Too many requests. Wait a moment and try again."],
  OTP_INVALID: ["invalid_code", "That code isn't right. Check it and try again."],
  OTP_EXPIRED: ["expired_code", "That code has expired. Request a new one."],
  OTP_ATTEMPTS_EXCEEDED: ["attempts_exceeded", "Too many incorrect attempts. Request a new code."],
  ACCOUNT_DISABLED: ["account_disabled", "This account has been disabled. Contact support."],
  INVALID_ACCESS_TOKEN: ["unauthorized", "Your session has expired. Sign in again."],
  INVALID_REFRESH_TOKEN: ["unauthorized", "Your session has expired. Sign in again."],
  INVALID_USERNAME: ["invalid_username", "That username isn't allowed. Use 3\u201330 lower-case letters, numbers or single underscores."],
  USERNAME_TAKEN: ["username_taken", "That username is already taken."],
  OAUTH_FAILED: ["server", "Sign-in with that provider is unavailable right now."],
};

function mapError(status: number, code?: string, message?: string, retryAfter?: number): AuthError {
  const known = code ? MESSAGES[code.toUpperCase()] : undefined;
  if (known) return new AuthError(known[0], message || known[1], { status, code, retryAfter });

  if (status === 429) return new AuthError("rate_limited", message ?? MESSAGES.RATE_LIMIT_EXCEEDED[1], { status, code, retryAfter });
  if (status === 401) return new AuthError("unauthorized", message ?? "Your session has expired. Sign in again.", { status, code });
  if (status === 403) return new AuthError("account_disabled", message ?? "You don't have access to that.", { status, code });
  if (status === 409) return new AuthError("username_taken", message ?? MESSAGES.USERNAME_TAKEN[1], { status, code });
  if (status === 400 || status === 422) return new AuthError("invalid_email", message ?? "Check the details and try again.", { status, code });
  if (status >= 500) return new AuthError("server", message ?? "EshSpeaks is having trouble right now.", { status, code });
  return new AuthError("unknown", message ?? "Something went wrong.", { status, code });
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------- request */
type RequestOptions = RequestInit & { auth?: boolean; retryOn401?: boolean };

async function rawRequest(path: string, { auth, ...init }: RequestOptions = {}): Promise<Response> {
  if (!API_BASE_URL) throw new AuthError("server", "Authentication service is not configured.");
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  };
  const token = auth ? tokenStore.access() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    return await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, { ...init, headers, credentials: "include" });
  } catch {
    throw new AuthError("network", "We couldn't reach EshSpeaks. Check your connection and try again.");
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await rawRequest(path, options);

  // One transparent refresh attempt for authenticated calls.
  if (res.status === 401 && options.auth && options.retryOn401 !== false) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await rawRequest(path, { ...options, retryOn401: false });
  }

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) {
    const retryHeader = res.headers.get("Retry-After");
    throw mapError(
      res.status,
      body?.code ?? body?.error?.code ?? body?.error,
      body?.message ?? body?.error?.message,
      retryHeader ? Number(retryHeader) : body?.retryAfter,
    );
  }
  return (body ?? {}) as T;
}

/* ---------------------------------------------------------------- sessions */
function normalizeSession(body: any): AuthSession {
  const user: CurrentUser = body?.user ?? body?.data?.user ?? body;
  const tokens = body?.tokens ?? body;
  tokenStore.set({ accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken });
  return {
    user,
    accessToken: tokens?.accessToken,
    refreshToken: tokens?.refreshToken,
    onboardingRequired: Boolean(body?.onboarding?.required ?? !user?.username),
  };
}

async function tryRefresh(): Promise<boolean> {
  try {
    const stored = tokenStore.refresh();
    const body = await request<any>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(stored ? { refreshToken: stored } : {}),
      retryOn401: false,
    });
    tokenStore.set({ accessToken: body?.accessToken ?? body?.tokens?.accessToken, refreshToken: body?.refreshToken ?? body?.tokens?.refreshToken });
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

/* ------------------------------------------------------------------- OAuth */
/** Google sign-in is a full-page navigation — never fetch this endpoint. */
export function googleAuthUrl(returnTo?: string, action?: string) {
  if (!API_BASE_URL) throw new AuthError("server", "Authentication service is not configured.");
  const url = new URL(`${API_BASE_URL}${API_PREFIX}/auth/google`);
  if (returnTo) url.searchParams.set("returnTo", returnTo);
  if (action) url.searchParams.set("action", action);
  return url.toString();
}

/* ----------------------------------------------------------------- service */
export const authService = {
  /**
   * Request a 6-digit email code. Always resolves on 200 — the API is
   * deliberately enumeration-safe, so never branch on "account exists".
   */
  requestEmailCode: (email: string, opts: { returnTo?: string; action?: string } = {}) =>
    request<Record<string, never>>("/auth/email/request", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), ...opts }),
    }),

  /** Resend uses the same endpoint; the API enforces one send per minute. */
  resendEmailCode: (email: string, opts: { returnTo?: string; action?: string } = {}) =>
    authService.requestEmailCode(email, opts),

  verifyEmailCode: async (email: string, code: string, opts: { returnTo?: string; action?: string } = {}) =>
    normalizeSession(
      await request<any>("/auth/email/verify", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), code, ...opts }),
      }),
    ),

  getCurrentUser: async () => {
    const body = await request<any>("/auth/me", { method: "GET", auth: true });
    return (body?.user ?? body) as CurrentUser;
  },

  refresh: tryRefresh,

  setUsername: async (username: string) => {
    const body = await request<any>("/users/me/username", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ username: username.trim().toLowerCase() }),
    });
    return (body?.user ?? body) as CurrentUser;
  },

  logout: async () => {
    try {
      const refreshToken = tokenStore.refresh();
      await request<void>("/auth/logout", {
        method: "POST",
        auth: true,
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        retryOn401: false,
      });
    } finally {
      tokenStore.clear();
    }
  },

  googleAuthUrl,
  startGoogle: (returnTo?: string, action?: string) => window.location.assign(googleAuthUrl(returnTo, action)),
};

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Mirrors the server rule: 3–30 chars, lower-case, digits, single interior underscores. */
export const USERNAME_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export function validateUsername(raw: string): string | null {
  const value = raw.trim();
  if (value.length < 3 || value.length > 30) return "Use between 3 and 30 characters.";
  if (/[^a-z0-9_]/.test(value)) return "Lower-case letters, numbers and underscores only.";
  if (!USERNAME_PATTERN.test(value)) return "Underscores must sit between letters or numbers \u2014 no doubles, no edges.";
  return null;
}
