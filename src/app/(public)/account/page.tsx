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
    return (
      <div className="container-colouresh py-16 text-center text-ink-soft">
        Loading your account...
      </div>
    );
  }

  const isEditorial = EDITORIAL_ROLES.includes(role as (typeof EDITORIAL_ROLES)[number]);
  const tier = tierById(currentTierId(user.membershipTier));
  const displayName = user.displayName ?? user.username ?? user.email.split("@")[0];

  return (
    <div className="container-colouresh mx-auto max-w-4xl py-10 sm:py-14">
      <Suspense fallback={null}>
        <CheckoutReturnBanner />
      </Suspense>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="chip">
            <span className="inline-block h-2 w-2 rounded-full bg-orange" />
            Your account
          </span>
          <h1 className="mt-3 truncate text-[32px] font-semibold text-ink sm:text-[40px]">
            {displayName}
          </h1>
          <p className="mt-1 truncate text-sm text-ink-soft">{user.email}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {ROLE_LABEL[role] ?? role}
            {isEditorial ? (
              <>
                {" · "}
                <Link href="/admin" className="font-semibold text-orange hover:underline">
                  Newsroom admin
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="shrink-0 rounded-full border-2 border-ink px-4 py-2 text-xs font-bold text-ink transition-transform hover:-translate-y-0.5"
        >
          Sign out
        </button>
      </header>

      {/* Membership */}
      <section className="mt-6 grid gap-4 sm:grid-cols-[1.1fr_1fr]">
        <div
          className={`flex flex-col justify-between rounded-2xl border-2 border-ink p-6 ${
            isSubscriber ? "bg-ink text-white" : "bg-white text-ink"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Colouresh</span>
            <span
              className={`rounded-full border-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                isSubscriber ? "border-white/30 text-white/80" : "border-line text-ink-soft"
              }`}
            >
              {isSubscriber ? "Active" : "Free"}
            </span>
          </div>
          <p className="mt-10 font-serif text-3xl">
            The List <span className="opacity-70">{tier.name}</span>
          </p>
          <p
            className={`mt-6 truncate text-xs font-bold uppercase tracking-widest ${
              isSubscriber ? "text-white/70" : "text-ink-soft"
            }`}
          >
            {displayName}
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border-2 border-ink bg-white p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Current plan</p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {tier.name}
              <span className="ml-2 text-sm font-medium text-ink-soft">
                {tier.price.monthly === 0 ? "Free" : formatPrice(tier.price.monthly, "monthly")}
              </span>
            </p>
          </div>
          <p className="text-xs text-ink-soft">
            Renewal date and billing history will appear here once the billing backend is connected.
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            <Link href="/pricing" className="btn-primary flex-1 justify-center">
              {isSubscriber ? "Change plan" : "Upgrade"}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            {isSubscriber ? (
              <button
                type="button"
                disabled
                title="Self-serve cancellation is not live yet"
                className="cursor-not-allowed rounded-full border-2 border-line px-4 py-2.5 text-sm font-semibold text-ink-soft"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <ProfileSettings />

      {/* Billing shells, pending backend */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border-2 border-ink bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <CreditCard className="h-4 w-4 text-orange" strokeWidth={1.75} />
            Payment method
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Your saved card will show here once the billing provider is connected.
          </p>
        </section>

        <section className="rounded-2xl border-2 border-ink bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <Settings2 className="h-4 w-4 text-orange" strokeWidth={1.75} />
            Preferences
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Newsletter and notification preferences arrive with the Sprint 4 preferences work.
          </p>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border-2 border-ink bg-white p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Receipt className="h-4 w-4 text-orange" strokeWidth={1.75} />
          Invoices
        </h2>
        <p className="mt-3 text-sm text-ink-soft">
          {isSubscriber
            ? "Your payment receipts will list here once invoice history is exposed by the backend."
            : "No invoices yet. You are on the free Grey tier."}
        </p>
      </section>

      {isEditorial ? (
        <section className="mt-4 rounded-2xl border-2 border-line bg-paper-2 p-5">
          <h2 className="text-lg font-semibold text-ink">Editorial</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Your role ({ROLE_LABEL[role] ?? role}) has newsroom access.{" "}
            <Link href="/admin" className="font-semibold text-orange hover:underline">
              Open the newsroom admin
            </Link>
            .
          </p>
        </section>
      ) : null}
    </div>
  );
}
