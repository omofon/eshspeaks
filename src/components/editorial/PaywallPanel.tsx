"use client";

import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { usePreview } from "@/lib/dev/previewTier";

export function PaywallPanel() {
  const { isSubscriber } = useAuth();
  const { override, enabled } = usePreview();

  // Real subscription status, with a dev-only override layered on top —
  // never the other way around. In production `override` is always null.
  const previewingPremium = enabled && override === "premium";
  const effectivelySubscriber = isSubscriber || previewingPremium;

  if (effectivelySubscriber) return null; // subscriber (real or previewed) never sees the paywall

  return (
    <section className="relative mt-8 rounded-md border border-gold bg-card p-6 shadow-card">
      <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-[11px] font-medium text-gold-foreground">
        <Lock className="h-3 w-3" strokeWidth={2} />
        Premium reporting
      </div>
      <h2 className="mt-2 font-serif text-2xl text-navy">
        The rest of this story is for subscribers
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        This piece is built on documents and first-hand briefings. Premium keeps that reporting
        funded, removes advertising, and unlocks the full archive across all eight sections.
      </p>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {[
          "Full access to premium investigations",
          "Ad-free reading across the site",
          "The market dashboard and data notes",
          "Section newsletters, curated weekly",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/pricing"
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-navy"
        >
          See plans
        </Link>
        <span className="text-xs text-muted-foreground">From \u20a64,500 per month</span>
      </div>
    </section>
  );
}
