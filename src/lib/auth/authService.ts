import { API_BASE_URL } from "./config";
import { getSafeReturnTo } from "./returnTo";
import { tokenStore } from "./tokenStore";
import type { CurrentUser, VerifyResult } from "./types";

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
  status: number | undefined;
  code: string | undefined;
  retryAfter: number | undefined;
  constructor(
    kind: AuthErrorKind,
    message: string,
    opts: {
      status?: number | undefined;
      code?: string | undefined;
      retryAfter?: number | undefined;
    } = {},
  ) {
    super(message);
    this.name = "AuthError";
    this.kind = kind;
    this.status = opts.status;
    this.code = opts.code;
    this.retryAfter = opts.retryAfter;
  }
}

export type { CurrentUser };

export type AuthSession = {
  user: CurrentUser;
  accessToken: string;
  refreshToken: string;
  onboardingRequired: boolean;
  onboardingStep?: string | undefined;
};

const API_PREFIX = "/api/v1";

/**
 * The real response envelope, confirmed live. `errorCode` is coarse
 * (BAD_REQUEST/UNAUTHORIZED/...); the specific reason (OTP_EXPIRED,
 * USERNAME_TAKEN, ...) lives in `appErrorCode` — confirmed by curling
 * /auth/email/verify with a stale code, which came back
 * `{errorCode:"BAD_REQUEST", appErrorCode:"OTP_EXPIRED"}`. Branch on
 * appErrorCode first, never on message text.
 */
interface Envelope<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode?: string;
  appErrorCode?: string;
}

/* ------------------------------------------------------------------ errors */
const MESSAGES: Record<string, [AuthErrorKind, string]> = {
  RATE_LIMIT_EXCEEDED: ["rate_limited", "Too many requests. Wait a moment and try again."],
  OTP_INVALID: ["invalid_code", "That code isn't right. Check it and try again."],
  OTP_EXPIRED: ["expired_code", "That code has expired. Request a new one."],
  OTP_ATTEMPTS_EXCEEDED: ["attempts_exceeded", "Too many incorrect attempts. Request a new code."],
  ACCOUNT_DISABLED: ["account_disabled", "This account has been disabled. Contact support."],
  INVALID_ACCESS_TOKEN: ["unauthorized", "Your session has expired. Sign in again."],
  INVALID_REFRESH_TOKEN: ["unauthorized", "Your session has expired. Sign in again."],
  INVALID_USERNAME: [
    "invalid_username",
    "That username isn't allowed. Use 3\u201330 lower-case letters, numbers or single underscores.",
  ],
  USERNAME_TAKEN: ["username_taken", "That username is already taken."],
  OAUTH_FAILED: ["server", "Sign-in with that provider is unavailable right now."],
};

function mapError(
  status: number,
  code?: string | undefined,
  message?: string | undefined,
  retryAfter?: number | undefined,
): AuthError {
  const known = code ? MESSAGES[code.toUpperCase()] : undefined;
  if (known) return new AuthError(known[0], message || known[1], { status, code, retryAfter });

  if (status === 429)
    return new AuthError("rate_limited", message ?? MESSAGES["RATE_LIMIT_EXCEEDED"]![1], {
      status,
      code,
      retryAfter,
    });
  if (status === 401)
    return new AuthError("unauthorized", message ?? "Your session has expired. Sign in again.", {
      status,
      code,
    });
  if (status === 403)
    return new AuthError("account_disabled", message ?? "You don't have access to that.", {
      status,
      code,
    });
  if (status === 409)
    return new AuthError("username_taken", message ?? MESSAGES["USERNAME_TAKEN"]![1], {
      status,
      code,
    });
  if (status === 400 || status === 422)
    return new AuthError("invalid_email", message ?? "Check the details and try again.", {
      status,
      code,
    });
  if (status >= 500)
    return new AuthError("server", message ?? "EshSpeaks is having trouble right now.", {
      status,
      code,
    });
  return new AuthError("unknown", message ?? "Something went wrong.", { status, code });
}

function safeJson(text: string): unknown {
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
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    // CONFIRMED: the API does set cookies (esh_at / esh_rt) on
    // /auth/email/verify, but they're scoped to the backend's own domain
    // (SameSite=Lax, not Secure) and frontend/backend are different
    // origins — the browser will never attach them to a request this app
    // makes, and a Next.js server here can't read them either (see the
    // removed getServerSession.ts). They are not a usable session
    // mechanism for this frontend. credentials:"include" is kept because
    // it's harmless, not because anything here relies on it — the
    // Authorization: Bearer header above is the only real auth mechanism.
    return await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new AuthError(
      "network",
      "We couldn't reach EshSpeaks. Check your connection and try again.",
    );
  }
}

/** Unwraps {success,data,message,errorCode} and returns `data` typed as T. */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await rawRequest(path, options);

  if (res.status === 401 && options.auth && options.retryOn401 !== false) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await rawRequest(path, { ...options, retryOn401: false });
  }

  const text = await res.text();
  const body = text ? (safeJson(text) as Envelope<T> | null) : null;

  if (!res.ok || body?.success === false) {
    const retryHeader = res.headers.get("Retry-After");
    throw mapError(
      res.status,
      body?.appErrorCode ?? body?.errorCode,
      body?.message,
      retryHeader ? Number(retryHeader) : undefined,
    );
  }
  return body!.data;
}

/* ---------------------------------------------------------------- sessions */
function normalizeSession(data: VerifyResult): AuthSession {
  tokenStore.set({
    accessToken: data.session.accessToken,
    refreshToken: data.session.refreshToken,
    expiresIn: data.session.expiresIn,
  });
  return {
    user: data.user,
    accessToken: data.session.accessToken,
    refreshToken: data.session.refreshToken,
    onboardingRequired: data.onboarding.required,
    onboardingStep: data.onboarding.step,
  };
}

async function tryRefresh(): Promise<boolean> {
  try {
    const stored = tokenStore.refresh();
    if (!stored) return false; // nothing to refresh with — this API has no refresh cookie fallback
    const data = await request<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      "/auth/refresh",
      { method: "POST", body: JSON.stringify({ refreshToken: stored }), retryOn401: false },
    );
    tokenStore.set(data);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

/* ------------------------------------------------------------------- OAuth */
export function googleAuthUrl(returnTo?: string, action?: string) {
  if (!API_BASE_URL) throw new AuthError("server", "Authentication service is not configured.");
  const url = new URL(`${API_BASE_URL}${API_PREFIX}/auth/google`);
  url.searchParams.set("returnTo", getSafeReturnTo(returnTo));
  if (action) url.searchParams.set("action", action);
  return url.toString();
}

/* ----------------------------------------------------------------- service */
type EmailFlowOpts = { returnTo?: string | undefined; action?: string | undefined };

export const authService = {
  requestEmailCode: (email: string, opts: EmailFlowOpts = {}) =>
    request<Record<string, never>>("/auth/email/request", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), ...opts }),
    }),

  resendEmailCode: (email: string, opts: EmailFlowOpts = {}) =>
    authService.requestEmailCode(email, opts),

  verifyEmailCode: async (email: string, code: string, opts: EmailFlowOpts = {}) =>
    normalizeSession(
      await request<VerifyResult>("/auth/email/verify", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), code, ...opts }),
      }),
    ),

  getCurrentUser: () => request<CurrentUser>("/auth/me", { method: "GET", auth: true }),

  refresh: tryRefresh,

  setUsername: (username: string) =>
    request<CurrentUser>("/users/me/username", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ username: username.trim().toLowerCase() }),
    }),

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
  startGoogle: (returnTo?: string, action?: string) =>
    window.location.assign(googleAuthUrl(returnTo, action)),
};

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const USERNAME_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export function validateUsername(raw: string): string | null {
  const value = raw.trim();
  if (value.length < 3 || value.length > 30) return "Use between 3 and 30 characters.";
  if (/[^a-z0-9_]/.test(value)) return "Lower-case letters, numbers and underscores only.";
  if (!USERNAME_PATTERN.test(value))
    return "Underscores must sit between letters or numbers \u2014 no doubles, no edges.";
  return null;
}
