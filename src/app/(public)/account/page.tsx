"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CreditCard, Receipt, Settings2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ProfileSettings } from "@/components/account/ProfileSettings";
import { CheckoutReturnBanner } from "@/components/account/CheckoutReturnBanner";
import { currentTierId, formatPrice, tierById } from "@/lib/membership";

const EDITORIAL_ROLES = [
  "contributor",
  "state_correspondent",
  "section_lead",
  "chief_editor",
] as const;

const ROLE_LABEL: Record<string, string> = {
  reader: "Reader",
  premium: "Premium reader",
  contributor: "Contributor",
  state_correspondent: "State correspondent",
  section_lead: "Section lead",
  chief_editor: "Chief editor",
};

export default function AccountPage() {
  const { user, status, isAuthenticated, isSubscriber, role, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login?returnTo=%2Faccount");
  }, [status, router]);

  if (status === "loading" || !isAuthenticated || !user) {
    return <div className="py-16 text-center text-text-secondary">Loading your account...</div>;
  }

  const isEditorial = EDITORIAL_ROLES.includes(role as (typeof EDITORIAL_ROLES)[number]);
  const tier = tierById(currentTierId(user.membershipTier));
  const displayName = user.displayName ?? user.username ?? user.email.split("@")[0];

  return (
    <div className="mx-auto max-w-4xl">
      <Suspense fallback={null}>
        <CheckoutReturnBanner />
      </Suspense>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
            Your account
          </p>
          <h1 className="mt-1 truncate font-serif text-4xl text-brand-navy sm:text-5xl">
            {displayName}
          </h1>
          <p className="mt-1 truncate text-sm text-text-secondary">{user.email}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {ROLE_LABEL[role] ?? role}
            {isEditorial ? (
              <>
                {" · "}
                <Link href="/admin" className="font-medium text-brand-orange hover:underline">
                  Newsroom admin
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="shrink-0 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-semibold text-brand-navy transition-colors hover:bg-background-soft"
        >
          Sign out
        </button>
      </header>

      {/* Membership */}
      <section className="mt-6 grid gap-4 sm:grid-cols-[1.1fr_1fr]">
        <div
          className={`flex flex-col justify-between rounded-lg border p-6 ${
            isSubscriber
              ? "border-navy bg-navy text-white"
              : "border-border bg-card text-brand-navy"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em]">EshSpeaks</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                isSubscriber ? "border-white/30 text-white/80" : "border-border text-text-secondary"
              }`}
            >
              {isSubscriber ? "Active" : "Free"}
            </span>
          </div>
          <p className="mt-10 font-serif text-3xl uppercase tracking-tight">
            The List <span className="opacity-70">{tier.name}</span>
          </p>
          <p
            className={`mt-6 truncate text-xs font-semibold uppercase tracking-widest ${
              isSubscriber ? "text-white/70" : "text-text-secondary"
            }`}
          >
            {displayName}
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Current plan
            </p>
            <p className="mt-1 font-serif text-xl text-brand-navy">
              {tier.name}
              <span className="ml-2 text-sm font-medium text-text-secondary">
                {tier.price.monthly === 0 ? "Free" : formatPrice(tier.price.monthly, "monthly")}
              </span>
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Renewal date and billing history will appear here once the billing backend is connected.
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            <Link
              href="/pricing"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
            >
              {isSubscriber ? "Change plan" : "Upgrade"}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            {isSubscriber ? (
              <button
                type="button"
                disabled
                title="Self-serve cancellation is not live yet"
                className="cursor-not-allowed rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-text-muted"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-6">
        <ProfileSettings />
      </div>

      {/* Billing shells, pending backend */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg text-brand-navy">
            <CreditCard className="h-4 w-4 text-brand-orange" strokeWidth={1.75} />
            Payment method
          </h2>
          <p className="mt-3 text-sm text-text-secondary">
            Your saved card will show here once the billing provider is connected.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg text-brand-navy">
            <Settings2 className="h-4 w-4 text-brand-orange" strokeWidth={1.75} />
            Preferences
          </h2>
          <p className="mt-3 text-sm text-text-secondary">
            Newsletter and notification preferences arrive with the Sprint 4 preferences work.
          </p>
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-serif text-lg text-brand-navy">
          <Receipt className="h-4 w-4 text-brand-orange" strokeWidth={1.75} />
          Invoices
        </h2>
        <p className="mt-3 text-sm text-text-secondary">
          {isSubscriber
            ? "Your payment receipts will list here once invoice history is exposed by the backend."
            : "No invoices yet. You are on the free Grey tier."}
        </p>
      </section>

      {isEditorial ? (
        <section className="mt-4 rounded-lg border border-border bg-background-soft p-5">
          <h2 className="font-serif text-lg text-brand-navy">Editorial</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Your role ({ROLE_LABEL[role] ?? role}) has newsroom access.{" "}
            <Link href="/admin" className="font-medium text-brand-orange hover:underline">
              Open the newsroom admin
            </Link>
            .
          </p>
        </section>
      ) : null}
    </div>
  );
}
