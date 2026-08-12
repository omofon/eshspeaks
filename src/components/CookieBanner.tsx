"use client";

import Link from "next/link";
import { useCookieConsent } from "@/lib/cookieConsent";

export function CookieBanner() {
  const { isBannerVisible, acceptAll, rejectNonEssential, openSettings } = useCookieConsent();

  if (!isBannerVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background-soft/95 px-4 py-4 shadow-raised backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="font-serif text-2xl text-brand-navy">We use cookies</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            EshSpeaks uses cookies to keep the site working, understand how readers use our
            publication, and improve your experience. You can review or change your choices at any
            time.
          </p>
          <Link
            href="/privacy"
            className="mt-2 inline-block text-sm font-medium text-brand-orange hover:underline"
          >
            Privacy Policy
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-sm bg-navy px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-navy-soft"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-muted"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={openSettings}
            className="rounded-sm border border-brand-orange/30 bg-brand-orange-soft px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-orange-soft/80"
          >
            Manage cookies
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
