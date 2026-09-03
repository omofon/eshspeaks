/**
 * CSRF token, read from the `esh_csrf` cookie.
 *
 * The backend runs a double-submit-cookie CSRF guard (see the backend's
 * "Cross-site cookies + CSRF protection" note). On every sign-in it writes a
 * random token to a **non-HttpOnly** cookie, `esh_csrf`, on purpose: its
 * whole job is to be readable by page script so the client can echo it back
 * as an `X-CSRF-Token` header on every state-changing request. The guard
 * then checks header === cookie; a cross-site attacker's forged request
 * carries the cookie automatically but cannot read it to set the header.
 *
 * When does this frontend actually need it?
 *
 *  - Email/OTP sign-in returns bearer tokens in the JSON body, and every
 *    authenticated request sends `Authorization: Bearer …`. The guard skips
 *    Bearer callers, so the header is a harmless no-op there.
 *  - Google OAuth is a full-page redirect: the backend sets its session
 *    cookies (`esh_at`, `esh_rt`, `esh_csrf`) and bounces back, and no
 *    bearer token is ever handed to page script. Those sessions authenticate
 *    by cookie (`SameSite=None` cross-site), so their writes DO hit the CSRF
 *    guard and MUST carry this header or they 403.
 *
 * Sending it on every mutating request regardless is therefore both safe and
 * sufficient: present it whenever the cookie exists, skip it when it does not.
 */

const CSRF_COOKIE = "esh_csrf";

export function readCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1] ?? "") || null;
  } catch {
    return match[1] || null;
  }
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Header to merge into a request's headers, empty for reads or when no cookie is set. */
export function csrfHeader(method: string | undefined): Record<string, string> {
  if (!MUTATING_METHODS.has((method ?? "GET").toUpperCase())) return {};
  const token = readCsrfToken();
  return token ? { "X-CSRF-Token": token } : {};
}
