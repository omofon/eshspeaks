"use client";

import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { useCookieConsent } from "@/lib/cookieConsent";

const CATEGORIES = [
  {
    key: "essential",
    label: "Essential",
    always: true,
    body: "Keeps you signed in and remembers your cookie choice. Can't be turned off — the site doesn't work without these.",
  },
  {
    key: "analytics",
    label: "Analytics",
    always: false,
    body: "Helps us understand which stories and sections readers actually use, so we can put reporting resources where they matter.",
  },
  {
    key: "personalization",
    label: "Personalization",
    always: false,
    body: "Remembers preferences like your preview settings so the site feels tailored on your next visit.",
  },
  {
    key: "advertising",
    label: "Advertising",
    always: false,
    body: "Supports the display advertising that keeps free stories free. Premium subscribers never see ads regardless of this setting.",
  },
] as const;

export default function CookiesPage() {
  const { openSettings } = useCookieConsent();

  return (
    <LegalPageLayout
      kicker="Legal"
      title="Cookie policy"
      intro="EshSpeaks uses four categories of cookies and local storage. Only Essential is required."
    >
      <div className="space-y-6">
        {CATEGORIES.map((c) => (
          <LegalSection key={c.key} title={c.label}>
            <p>{c.body}</p>
            <p className="text-xs uppercase tracking-wide text-text-muted">
              {c.always ? "Always on" : "Off by default"}
            </p>
          </LegalSection>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-brand-navy">Change your preferences</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          You can change your cookie choices at any time — the setting applies immediately and is
          remembered for future visits.
        </p>
        <button
          type="button"
          onClick={openSettings}
          className="mt-4 rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-navy"
        >
          Manage cookie preferences
        </button>
      </div>
    </LegalPageLayout>
  );
}
