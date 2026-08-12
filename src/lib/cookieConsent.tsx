"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CookieCategory = "essential" | "analytics" | "personalization" | "advertising";

export type CookiePreferences = Record<CookieCategory, boolean>;

export const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  personalization: false,
  advertising: false,
};

const STORAGE_KEY = "eshspeaks.cookie-consent";

function readStoredPreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      personalization: Boolean(parsed.personalization),
      advertising: Boolean(parsed.advertising),
    };
  } catch {
    return null;
  }
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasDecision, setHasDecision] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredPreferences();
    if (stored) {
      setPreferences(stored);
      setHasDecision(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const consentState = { ...preferences };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consentState));
    window.dispatchEvent(new CustomEvent("eshspeaks:cookie-consent", { detail: consentState }));

    const root = document.documentElement;
    root.dataset["analyticsConsent"] = String(preferences.analytics);
    root.dataset["personalizationConsent"] = String(preferences.personalization);
    root.dataset["advertisingConsent"] = String(preferences.advertising);
  }, [preferences]);

  const savePreferences = useCallback((next: Partial<CookiePreferences>) => {
    setPreferences((current) => {
      const merged = {
        ...current,
        essential: true,
        ...next,
      };
      setHasDecision(true);
      return merged;
    });
  }, []);

  const acceptAll = useCallback(() => {
    const next = {
      essential: true,
      analytics: true,
      personalization: true,
      advertising: true,
    };
    setPreferences(next);
    setHasDecision(true);
  }, []);

  const rejectNonEssential = useCallback(() => {
    const next = {
      essential: true,
      analytics: false,
      personalization: false,
      advertising: false,
    };
    setPreferences(next);
    setHasDecision(true);
  }, []);

  const openSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  return useMemo(
    () => ({
      preferences,
      hasDecision,
      settingsOpen,
      isBannerVisible: !hasDecision,
      setPreferences: savePreferences,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openSettings,
      closeSettings,
      essential: true,
      analytics: preferences.analytics,
      personalization: preferences.personalization,
      advertising: preferences.advertising,
    }),
    [
      preferences,
      hasDecision,
      settingsOpen,
      savePreferences,
      acceptAll,
      rejectNonEssential,
      openSettings,
      closeSettings,
    ],
  );
}
