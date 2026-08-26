"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAuthGatedAction } from "@/lib/auth/useAuthGatedAction";

const FREE_BENEFITS = [
  "Every free story across all sections",
  "Comment on stories and join the discussion",
  "Weekly section newsletters",
];

const PREMIUM_BENEFITS = [
  "Full access to premium investigations and interviews",
  "Ad-free reading across the entire site",
  "The market dashboard and data notes",
  "Early access to new reporting features",
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Editorial independence",
    body: "Premium subscriptions fund reporting directly — they're not a workaround for advertisers or sponsors to shape coverage.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    body: "We don't sell reader data. See our privacy policy for the specifics of what's collected and why.",
  },
  {
    icon: Sparkles,
    title: "Built for readers who stay",
    body: "Premium is for people who read EshSpeaks regularly, not a paywall dressed up as a growth trick.",
  },
];

/**
 * No subscription/billing endpoint exists yet (confirmed against the live
 * OpenAPI spec — no Paystack, no checkout, nothing). So this page does the
 * three things the product spec actually allows: explain the value,
 * require sign-in via the existing auth-gate architecture
 * (useAuthGatedAction — same mechanism as every other gated action, not a
 * second auth system), and tell an authenticated free reader the honest
 * truth about billing rather than pretending to subscribe them.
 */
export default function PricingPage() {
  const { status, isAuthenticated, isSubscriber } = useAuth();
  const runOrRedirectToLogin = useAuthGatedAction("subscribe");
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          Membership
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">
          Support the journalism you actually read
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-text-secondary">
          Premium keeps the deep reporting funded — investigations, extended interviews and analysis
          that take longer than a news cycle to get right.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-8">
          <h2 className="font-serif text-2xl text-brand-navy">Free</h2>
          <p className="mt-2 text-sm text-text-secondary">Always free. No card required.</p>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-text-secondary">
            {FREE_BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" strokeWidth={2} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-lg border border-gold bg-card p-8 shadow-card">
          <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-foreground">
            <Lock className="h-3 w-3" strokeWidth={2} />
            Premium
          </div>
          <h2 className="mt-2 font-serif text-2xl text-brand-navy">Premium</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Full newsroom access. Billing details coming soon.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-text-secondary">
            {PREMIUM_BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {status === "loading" ? (
              <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
            ) : isSubscriber ? (
              <Link
                href="/account"
                className="flex h-11 w-full items-center justify-center rounded-md bg-navy text-sm font-semibold text-white hover:bg-navy/90"
              >
                You&rsquo;re on Premium — manage account
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    runOrRedirectToLogin(() => {
                      setShowComingSoon(true);
                    })
                  }
                  className="flex h-11 w-full items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground transition-colors hover:bg-navy"
                >
                  {isAuthenticated ? "Join Premium" : "Sign in to join Premium"}
                </button>
                {showComingSoon ? (
                  <p className="mt-3 rounded-sm border border-border bg-background-soft p-3 text-xs leading-5 text-text-secondary">
                    Premium billing isn&rsquo;t live yet — we&rsquo;re finishing that build now.
                    You&rsquo;re signed in, so there&rsquo;s nothing else to do; Premium will unlock
                    on your account automatically the moment it opens.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-8 border-t border-rule pt-10 sm:grid-cols-3">
        {TRUST_POINTS.map((point) => (
          <div key={point.title}>
            <point.icon className="h-5 w-5 text-brand-orange" strokeWidth={1.75} />
            <h3 className="mt-3 font-serif text-lg text-brand-navy">{point.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary">{point.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
