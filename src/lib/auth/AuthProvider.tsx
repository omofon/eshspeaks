"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authService } from "./authService";
import { tokenStore } from "./tokenStore";
import type { CurrentUser, UserRole } from "./types";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: CurrentUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isSubscriber: boolean;
  role: UserRole;
  needsUsername: boolean;
  /** Loose on purpose — role strings beyond "reader" aren't confirmed yet.
   *  Update this once the backend hands over the real UserRole list. */
  hasRole: (roles: UserRole | readonly UserRole[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Editorial rank, lowest to highest. "premium" and "reader" are both floor
 * ranks (0) for capability purposes — premium is a billing fact, not an
 * editorial capability, so it doesn't outrank reader here. Everything from
 * contributor up is a real capability ladder per backend's own schema
 * comment ("chief_editor" = "Full editorial override").
 */
const ROLE_RANK: Record<UserRole, number> = {
  reader: 0,
  premium: 0,
  contributor: 1,
  state_correspondent: 2,
  section_lead: 3,
  chief_editor: 4,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  };

  /** Refreshes ~60s before the access token actually expires, so requests
   *  near the end of its life don't eat a reactive 401-then-retry round trip. */
  const scheduleProactiveRefresh = useCallback(() => {
    clearRefreshTimer();
    const expiresAt = tokenStore.accessExpiresAt();
    if (!expiresAt) return;
    const msUntilRefresh = Math.max(expiresAt - Date.now() - 60_000, 5_000);
    refreshTimer.current = setTimeout(async () => {
      const ok = await authService.refresh();
      if (ok) scheduleProactiveRefresh();
    }, msUntilRefresh);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await authService.getCurrentUser();
      setUser(me);
      setStatus("authenticated");
      scheduleProactiveRefresh();
    } catch {
      setUser(null);
      setStatus("anonymous");
      clearRefreshTimer();
    }
  }, [scheduleProactiveRefresh]);

  useEffect(() => {
    // Bearer-only API: there's no session for getCurrentUser() to find on
    // a fresh load unless a refresh token survived in localStorage. Try
    // that first; only then ask who the user is.
    (async () => {
      const stored = tokenStore.refresh();
      if (stored) {
        const ok = await authService.refresh();
        if (!ok) {
          setStatus("anonymous");
          return;
        }
      } else {
        setStatus("anonymous");
        return;
      }
      await refresh();
    })();
    return clearRefreshTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    clearRefreshTimer();
    await authService.logout();
    setUser(null);
    setStatus("anonymous");
  }, []);

  /** Rank-based: chief_editor satisfies hasRole("contributor"), etc.
   *  If your policy is actually exact-match (a section_lead should NOT
   *  pass a contributor-only check), tell me — this is a one-line change
   *  but it's a real policy call, not a default I should silently pick. */
  const hasRole = useCallback(
    (required: UserRole | readonly UserRole[]) => {
      if (!user) return false;
      const wanted: readonly UserRole[] = Array.isArray(required) ? required : [required];
      const minRank = Math.min(...wanted.map((r) => ROLE_RANK[r]));
      return ROLE_RANK[user.role] >= minRank;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated" && Boolean(user),
      isSubscriber: user?.membershipTier === "PREMIUM",
      role: user?.role ?? "reader",
      needsUsername: Boolean(user && !user.username),
      hasRole,
      refresh,
      signOut,
    }),
    [user, status, hasRole, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
