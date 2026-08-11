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
import type { Tier } from "./data/types";

interface TierContextValue {
  tier: Tier;
  setTier: (t: Tier) => void;
  isLoggedIn: boolean;
  isPremium: boolean;
}

const TierContext = createContext<TierContextValue>({
  tier: "free",
  setTier: () => {},
  isLoggedIn: true,
  isPremium: false,
});

const KEY = "eshspeaks.tier";

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<Tier>("free");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as Tier | null;
    if (stored) setTierState(stored);
  }, []);

  const setTier = useCallback((t: Tier) => {
    setTierState(t);
    window.localStorage.setItem(KEY, t);
  }, []);

  const value = useMemo(
    () => ({ tier, setTier, isLoggedIn: tier !== "logged-out", isPremium: tier === "premium" }),
    [tier, setTier],
  );

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export const useTier = () => useContext(TierContext);
