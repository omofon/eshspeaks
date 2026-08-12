"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCookieConsent, type CookiePreferences } from "@/lib/cookieConsent";

const categoryConfig = [
  {
    key: "analytics",
    name: "Analytics",
    description: "Used to understand traffic, article engagement and site performance.",
    disabled: false,
  },
  {
    key: "personalization",
    name: "Personalization",
    description: "Used for preferences and personalization.",
    disabled: false,
  },
  {
    key: "advertising",
    name: "Advertising",
    description: "Used for advertising and measurement if the product uses advertising technology.",
    disabled: false,
  },
] as const;

export function CookieSettingsModal() {
  const { settingsOpen, closeSettings, preferences, acceptAll, savePreferences } =
    useCookieConsent();
  const [draft, setDraft] = useState<CookiePreferences>(preferences);
  const firstFocusableRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences, settingsOpen]);

  useEffect(() => {
    if (!settingsOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSettings();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen, closeSettings]);

  const updateCategory = (key: keyof Omit<CookiePreferences, "essential">, value: boolean) => {
    setDraft((current) => ({
      ...current,
      essential: true,
      [key]: value,
    }));
  };

  return (
    <Dialog open={settingsOpen} onOpenChange={(open) => (!open ? closeSettings() : undefined)}>
      <DialogContent
        className="max-h-[90vh] w-[min(92vw,640px)] overflow-y-auto rounded-lg border border-border bg-background-soft p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          firstFocusableRef.current?.focus();
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <DialogTitle className="font-serif text-3xl text-brand-navy">
              Cookie settings
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-text-secondary">
              Choose how EshSpeaks uses cookies on this device.
            </DialogDescription>
          </div>
          <button
            type="button"
            aria-label="Close cookie settings"
            onClick={closeSettings}
            className="rounded-sm p-2 text-text-secondary transition-colors hover:bg-muted hover:text-brand-navy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-md border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-navy">Essential</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Required for the site to work safely and reliably.
                </p>
              </div>
              <span className="rounded-full border border-border bg-muted px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary">
                Always active
              </span>
            </div>
          </div>

          {categoryConfig.map((category) => (
            <div key={category.key} className="rounded-md border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold text-brand-navy">{category.name}</Label>
                  <p className="mt-1 text-sm text-text-secondary">{category.description}</p>
                </div>
                <Switch
                  ref={category.key === "analytics" ? firstFocusableRef : undefined}
                  checked={draft[category.key]}
                  onCheckedChange={(value) => updateCategory(category.key, value)}
                  aria-label={`${category.name} cookies`}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="border-t border-border bg-background-soft px-6 py-4 sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setDraft({
                essential: true,
                analytics: false,
                personalization: false,
                advertising: false,
              });
            }}
            className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-muted"
          >
            Reject all
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                savePreferences(draft);
                closeSettings();
              }}
              className="rounded-sm border border-brand-orange/30 bg-brand-orange-soft px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-orange-soft/80"
            >
              Save preferences
            </button>
            <button
              type="button"
              onClick={() => {
                acceptAll();
                closeSettings();
              }}
              className="rounded-sm bg-navy px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-navy-soft"
            >
              Accept all
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CookieSettingsModal;
