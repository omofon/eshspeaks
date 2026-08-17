"use client";

import { useCallback, useEffect, useState } from "react";
import { authService, AuthError, type CurrentUser } from "./authService";

/** Reads GET /api/v1/auth/me once on mount; refresh is handled inside authService. */
export function useSession() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "anonymous">("loading");

  const load = useCallback(async () => {
    try {
      const me = await authService.getCurrentUser();
      setUser(me);
      setStatus("authenticated");
    } catch (e) {
      setUser(null);
      setStatus("anonymous");
      if (e instanceof AuthError && e.kind === "account_disabled") return;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus("anonymous");
  }, []);

  return { user, status, reload: load, signOut, needsUsername: Boolean(user && !user.username) };
}

export default useSession;
