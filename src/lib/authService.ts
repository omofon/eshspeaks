import { API_BASE_URL } from "./config";

export type AuthErrorKind =
  | "network"
  | "invalid_email"
  | "already_registered"
  | "not_found"
  | "invalid_code"
  | "expired_code"
  | "rate_limited"
  | "unauthorized"
  | "server"
  | "unknown";

export class AuthError extends Error {
  kind: AuthErrorKind;
  status: number | undefined;
  constructor(kind: AuthErrorKind, message: string, status?: number) {
    super(message);
    this.name = "AuthError";
    this.kind = kind;
    this.status = status;
  }
}

export type CurrentUser = {
  id: string;
  email: string;
  username: string | null;
  createdAt?: string;
};

export type EmailStartResult = {
  /** true when the backend created a brand-new account for this email */
  created: boolean;
  /** how long until the code expires, seconds */
  expiresIn?: number;
  /** seconds until a resend is allowed */
  resendAfter?: number;
};

const JSON_HEADERS = { "Content-Type": "application/json", Accept: "application/json" };

function mapError(status: number, code?: string, message?: string): AuthError {
  const c = (code ?? "").toLowerCase();
  if (c.includes("expired"))
    return new AuthError("expired_code", message ?? "That code has expired.", status);
  if (c.includes("invalid_code") || c.includes("otp"))
    return new AuthError("invalid_code", message ?? "That code isn't right.", status);
  if (status === 409 || c.includes("exists") || c.includes("registered"))
    return new AuthError(
      "already_registered",
      message ?? "An account already exists for this email.",
      status,
    );
  if (status === 404)
    return new AuthError("not_found", message ?? "We couldn't find that account.", status);
  if (status === 422 || status === 400)
    return new AuthError("invalid_email", message ?? "Enter a valid email address.", status);
  if (status === 429)
    return new AuthError(
      "rate_limited",
      message ?? "Too many attempts. Try again shortly.",
      status,
    );
  if (status === 401 || status === 403)
    return new AuthError("unauthorized", message ?? "Your session has expired.", status);
  if (status >= 500)
    return new AuthError("server", message ?? "EshSpeaks is having trouble right now.", status);
  return new AuthError("unknown", message ?? "Something went wrong.", status);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new AuthError("server", "Authentication service is not configured.");

  const { signal, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      credentials: "include", // session cookie is set by the backend
      ...(signal ? { signal } : {}),
      headers: { ...JSON_HEADERS, ...((init.headers as Record<string, string> | undefined) ?? {}) },
    });
  } catch {
    throw new AuthError(
      "network",
      "We couldn't reach EshSpeaks. Check your connection and try again.",
    );
  }

  const text = await res.text();
  const body = text ? safeJson(text) : null;
  const code = typeof body?.["code"] === "string" ? body["code"] : undefined;
  const error = typeof body?.["error"] === "string" ? body["error"] : undefined;
  const message = typeof body?.["message"] === "string" ? body["message"] : undefined;

  if (!res.ok) throw mapError(res.status, code ?? error, message);
  return (body ?? {}) as T;
}

function safeJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown> | null;
  } catch {
    return null;
  }
}

function oauthRedirect(provider: "google" | "apple", returnTo?: string) {
  if (!API_BASE_URL) throw new AuthError("server", "Authentication service is not configured.");
  const url = new URL(`${API_BASE_URL}/auth/${provider}`);
  if (returnTo) url.searchParams.set("returnTo", returnTo);
  window.location.assign(url.toString());
}

export const authService = {
  registerWithEmail: (email: string) =>
    request<EmailStartResult>("/auth/register/email", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  loginWithEmail: (email: string) =>
    request<EmailStartResult>("/auth/login/email", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resendOTP: (email: string) =>
    request<EmailStartResult>("/auth/otp/resend", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (email: string, code: string) =>
    request<{ user: CurrentUser }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  loginWithGoogle: (returnTo?: string) => oauthRedirect("google", returnTo),
  loginWithApple: (returnTo?: string) => oauthRedirect("apple", returnTo),

  getCurrentUser: () => request<CurrentUser>("/users/me", { method: "GET" }),

  checkUsername: (username: string, signal?: AbortSignal) =>
    request<{ available: boolean; reason?: string }>(
      `/users/username/availability?username=${encodeURIComponent(username)}`,
      signal ? { method: "GET", signal } : { method: "GET" },
    ),

  setUsername: (username: string) =>
    request<{ user: CurrentUser }>("/users/me/username", {
      method: "POST",
      body: JSON.stringify({ username }),
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),
};

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
