"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authService, type CurrentUser } from "@/lib/auth/authService";

export type SubscriptionTier = "free" | "premium";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  username: string;
  subscription: SubscriptionTier;
}

export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: AccountUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isPremium: boolean;
  subscription: SubscriptionTier;
  needsUsername: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  setSubscription: (tier: SubscriptionTier) => void;
}

const SUBSCRIPTION_KEY = "eshspeaks.auth.subscription";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: "loading",
  isAuthenticated: false,
  isPremium: false,
  subscription: "free",
  needsUsername: false,
  refresh: async () => {},
  signOut: async () => {},
  setSubscription: () => {},
});

function toAccountUser(me: CurrentUser, tier: SubscriptionTier): AccountUser {
  return {
    id: me.id,
    name: me.displayName ?? me.username ?? me.email.split("@")[0] ?? "Reader",
    email: me.email,
    username: me.username ?? "",
    subscription: tier,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [subscription, setSubscriptionState] = useState<SubscriptionTier>("free");

  // Local-only tier cache (replace once a billing endpoint exists).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SUBSCRIPTION_KEY);
    if (raw === "premium" || raw === "free") setSubscriptionState(raw);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await authService.getCurrentUser();
      setUser(toAccountUser(me, subscription));
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("anonymous");
    }
  }, [subscription]);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const setSubscription = useCallback((nextTier: SubscriptionTier) => {
    setSubscriptionState(nextTier);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SUBSCRIPTION_KEY, nextTier);
    }
    setUser((current) => (current ? { ...current, subscription: nextTier } : current));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated" && Boolean(user),
      isPremium: subscription === "premium",
      subscription,
      needsUsername: Boolean(user && !user.username),
      refresh,
      signOut,
      setSubscription,
    }),
    [user, status, subscription, refresh, signOut, setSubscription],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useSubscription() {
  const { subscription, isPremium, setSubscription } = useAuth();
  return { subscription, isPremium, setSubscription };
}
