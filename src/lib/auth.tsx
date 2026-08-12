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

export type SubscriptionTier = "free" | "premium";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  username: string;
  subscription: SubscriptionTier;
}

interface AuthContextValue {
  user: AccountUser | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  subscription: SubscriptionTier;
  signIn: (nextUser: AccountUser) => void;
  signOut: () => void;
  setSubscription: (tier: SubscriptionTier) => void;
}

const USER_KEY = "eshspeaks.auth.user";
const SUBSCRIPTION_KEY = "eshspeaks.auth.subscription";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isPremium: false,
  subscription: "free",
  signIn: () => {},
  signOut: () => {},
  setSubscription: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [subscription, setSubscriptionState] = useState<SubscriptionTier>("free");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawUser = window.localStorage.getItem(USER_KEY);
      const rawSubscription = window.localStorage.getItem(
        SUBSCRIPTION_KEY,
      ) as SubscriptionTier | null;

      if (rawUser) {
        const parsedUser = JSON.parse(rawUser) as AccountUser;
        setUser(parsedUser);
      }

      if (rawSubscription && (rawSubscription === "free" || rawSubscription === "premium")) {
        setSubscriptionState(rawSubscription);
      }
    } catch {
      // Keep the unauthenticated/default state when storage is unavailable.
    }
  }, []);

  const signIn = useCallback((nextUser: AccountUser) => {
    setUser(nextUser);
    setSubscriptionState(nextUser.subscription);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      window.localStorage.setItem(SUBSCRIPTION_KEY, nextUser.subscription);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setSubscriptionState("free");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.setItem(SUBSCRIPTION_KEY, "free");
    }
  }, []);

  const setSubscription = useCallback((nextTier: SubscriptionTier) => {
    setSubscriptionState(nextTier);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(SUBSCRIPTION_KEY, nextTier);
    }

    setUser((current) => {
      if (!current) return current;
      const nextUser = { ...current, subscription: nextTier };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      }
      return nextUser;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isPremium: subscription === "premium" || Boolean(user && user.subscription === "premium"),
      subscription,
      signIn,
      signOut,
      setSubscription,
    }),
    [user, subscription, signIn, signOut, setSubscription],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useSubscription() {
  const { subscription, isPremium, setSubscription } = useAuth();

  return {
    subscription,
    isPremium,
    setSubscription,
  };
}
