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

export type CookieCategory = "essential" | "analytics" | "personalization" | "advertising";

export type CookiePreferences = Record<CookieCategory, boolean>;

export const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  personalization: false,
  advertising: false,
};

const STORAGE_KEY = "colouresh.cookie-consent";

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

/** Writes the decision to storage, mirrors it onto `<html data-*>` for CSS/analytics-script
 *  hooks, and notifies anything listening for `colouresh:cookie-consent` (e.g. a future
 *  analytics loader gated on consent). Called directly from the action that made the
 *  decision, never from an effect keyed on `preferences` — that pattern used to fire once
 *  with default (not-yet-hydrated) values on every mount, silently overwriting a real prior
 *  decision's stored category choices with defaults for a moment. */
function persist(next: CookiePreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("colouresh:cookie-consent", { detail: next }));
  const root = document.documentElement;
  root.dataset["analyticsConsent"] = String(next.analytics);
  root.dataset["personalizationConsent"] = String(next.personalization);
  root.dataset["advertisingConsent"] = String(next.advertising);
}

interface CookieConsentContextValue {
  preferences: CookiePreferences;
  hasDecision: boolean;
  settingsOpen: boolean;
  isBannerVisible: boolean;
  setPreferences: (next: Partial<CookiePreferences>) => void;
  savePreferences: (next: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  essential: true;
  analytics: boolean;
  personalization: boolean;
  advertising: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

/**
 * A single shared instance, mounted once in the root layout. Every previous consumer
 * (CookieBanner, CookieSettingsModal, SiteFooter's "Cookie settings" link) called
 * `useCookieConsent()` as a bare hook, which gave each of them its own independent
 * `useState` — a decision made through the settings modal never reached the banner's own
 * `hasDecision`, so it could pop back up on the next re-render even though the user had
 * already chosen. Routing everything through one Provider fixes that at the source.
 */
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<CookiePreferences>(defaultPreferences);
  const [hasDecision, setHasDecision] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredPreferences();
    if (stored) {
      setPreferencesState(stored);
      setHasDecision(true);
    }
  }, []);

  const savePreferences = useCallback((next: Partial<CookiePreferences>) => {
    setPreferencesState((current) => {
      const merged = { ...current, essential: true as const, ...next };
      persist(merged);
      return merged;
    });
    setHasDecision(true);
  }, []);

  const acceptAll = useCallback(() => {
    const next: CookiePreferences = {
      essential: true,
      analytics: true,
      personalization: true,
      advertising: true,
    };
    setPreferencesState(next);
    setHasDecision(true);
    persist(next);
  }, []);

  const rejectNonEssential = useCallback(() => {
    const next: CookiePreferences = {
      essential: true,
      analytics: false,
      personalization: false,
      advertising: false,
    };
    setPreferencesState(next);
    setHasDecision(true);
    persist(next);
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      preferences,
      hasDecision,
      settingsOpen,
      isBannerVisible: !hasDecision,
      setPreferences: savePreferences,
      savePreferences,
      acceptAll,
      rejectNonEssential,
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

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within <CookieConsentProvider>");
  return ctx;
}
