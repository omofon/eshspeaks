/**
 * Centralized returnTo validation & continuation helpers.
 *
 * SECURITY: this is the ONLY place that decides whether a returnTo value is
 * safe to redirect to. Every call site — login page, verify page, username
 * page, OTP/email forms, the Google auth link, access gates, header links —
 * must run user-supplied returnTo through getSafeReturnTo before using it.
 * Never do `router.push(searchParams.get("returnTo")!)` or
 * `window.location.href = rawReturnTo` anywhere. Ever.
 *
 * Rule: unless the value is a genuine root-relative internal path
 * ("/something", not "//something", not "https://something"), fall back
 * to "/". No exceptions.
 */

const INTERNAL_ORIGIN = "https://internal.invalid";

export function getSafeReturnTo(returnTo?: string | null): string {
  if (returnTo === undefined || returnTo === null) return "/";

  const trimmed = returnTo.trim();
  if (!trimmed) return "/";

  // Must be root-relative. This single check rejects "https://...",
  // "http://...", "javascript:...", "data:...", and bare paths like
  // "articles/foo" that aren't actually root-relative.
  if (!trimmed.startsWith("/")) return "/";

  // Protocol-relative ("//evil.com") and the backslash variant
  // ("/\evil.com", which http(s)-scheme URL parsing normalizes to
  // "//evil.com") are the classic bypasses for a naive startsWith("/")
  // check. Reject both explicitly before anything else.
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return "/";

  // Defense in depth: resolve against a fixed internal origin and confirm
  // the parsed origin didn't move. Catches control-character / encoding
  // tricks the string checks above don't anticipate.
  let url: URL;
  try {
    url = new URL(trimmed, INTERNAL_ORIGIN);
  } catch {
    return "/";
  }
  if (url.origin !== INTERNAL_ORIGIN) return "/";

  const safePath = `${url.pathname}${url.search}${url.hash}`;
  return safePath.startsWith("/") ? safePath : "/";
}

export interface ContinuationParams {
  returnTo?: string | null;
  action?: string | null;
}

/**
 * Builds a query string (including the leading "?", or "" if empty) for
 * carrying returnTo/action across auth steps. Always normalizes returnTo
 * first. Omits returnTo entirely when it's just "/" so URLs stay clean —
 * "/" is the implicit default, not something that needs to round-trip.
 */
export function buildContinuationQuery(params: ContinuationParams): string {
  const safeReturnTo = getSafeReturnTo(params.returnTo);
  const qs = new URLSearchParams();
  if (safeReturnTo !== "/") qs.set("returnTo", safeReturnTo);
  if (params.action) qs.set("action", params.action);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** Builds "/login?returnTo=...&action=..." from the current path + an action. */
export function buildLoginHref(currentPath: string, action?: string): string {
  return `/login${buildContinuationQuery({ returnTo: currentPath, action })}`;
}
