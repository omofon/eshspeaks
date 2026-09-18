/**
 * Bearer-token storage. Confirmed live: this API has NO session cookies —
 * accessToken/refreshToken in the JSON body are the only mechanism, not a
 * fallback. That changes the storage tradeoff:
 *
 *  - accessToken: kept in memory ONLY (module-level variable). Short-lived
 *    (900s / 15min per the live response), so losing it on a hard refresh
 *    is an acceptable cost — it's silently re-derived via refreshToken on
 *    load. Never touches localStorage, so it isn't readable by a compromised
 *    third-party script (ad tags are explicitly in scope for this project).
 *
 *  - refreshToken: localStorage. This is the necessary tradeoff of a
 *    bearer-only API with no httpOnly cookie option — it has to survive a
 *    reload somewhere JS can reach it. Documented risk, not an oversight.
 */

const REFRESH_KEY = "esh.refreshToken";

/**
 * Fired whenever `clear()` runs — a real sign-out, or `tryRefresh()` in
 * authService.ts giving up because the refresh token itself is dead.
 * Nothing that touches tokens directly can reach back into AuthProvider's
 * React state, so this is how a session dying in the *background* (an
 * ordinary 401-retry mid-session, or the proactive pre-expiry refresh)
 * gets AuthProvider to flip to "anonymous" instead of sitting on a stale
 * "authenticated" status until something else notices. Same
 * window-CustomEvent idiom as lib/cookieConsent.ts.
 */
const SESSION_EXPIRED_EVENT = "colouresh:session-expired";

let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null; // epoch ms

export const tokenStore = {
  access: () => accessToken,

  accessExpiresAt: () => accessTokenExpiresAt,

  refresh: () => (typeof window === "undefined" ? null : window.localStorage.getItem(REFRESH_KEY)),

  set(tokens: { accessToken?: string | null; refreshToken?: string | null; expiresIn?: number }) {
    if (tokens.accessToken) {
      accessToken = tokens.accessToken;
      accessTokenExpiresAt = tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : null;
    }
    if (tokens.refreshToken && typeof window !== "undefined") {
      window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    }
  },

  clear() {
    accessToken = null;
    accessTokenExpiresAt = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(REFRESH_KEY);
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
  },

  /** AuthProvider-only: react to a session dying wherever it happens to die. */
  onSessionExpired(handler: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  },
};
