"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useCheckout } from "@/hooks/useCheckout";
import {
  TIERS,
  currentTierId,
  formatAmount,
  isTierPurchasable,
  type BillingCycle,
  type TierId,
} from "@/lib/membership";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Editorial independence",
    body: "Memberships fund reporting directly. They are not a workaround for advertisers or sponsors to shape coverage.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    body: "We do not sell reader data. Cancel any time from your account page.",
  },
  {
    icon: Sparkles,
    title: "Built for readers who stay",
    body: "Membership is for people who read EshSpeaks regularly, not a paywall dressed up as a growth trick.",
  },
];

const FAQ = [
  {
    q: "Can I switch tiers later?",
    a: "Yes. Upgrades apply immediately. Downgrades take effect at the end of your current period.",
  },
  {
    q: "Do I need an account to subscribe?",
    a: "Yes. Membership is attached to your reader account, so you sign in first. It takes about ten seconds.",
  },
  {
    q: "What happens when I cancel?",
    a: "You keep premium access until the period you paid for ends, then move back to Grey. Nothing is deleted.",
  },
];

export default function PricingPage() {
  const { status, isAuthenticated, isSubscriber, user } = useAuth();
  const router = useRouter();
  const checkout = useCheckout();

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [gate, setGate] = useState<TierId | null>(null);

  const activeTier = user ? currentTierId(user.membershipTier) : null;

  function choose(id: TierId) {
    if (id === "grey") {
      router.push(isAuthenticated ? "/account" : "/login?returnTo=%2Faccount");
      return;
    }
    if (!isAuthenticated) {
      setGate(id);
      return;
    }
    void checkout.start();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          Our membership
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl font-serif text-4xl leading-tight text-brand-navy sm:text-5xl">
          Simple membership for every kind of reader
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-text-secondary">
          Three tiers on The List. Start free, move up when the reporting earns it.
        </p>
      </header>

      <div className="mt-8 flex justify-center">
        <div
          className="inline-flex rounded-md border border-border bg-card p-1"
          role="tablist"
          aria-label="Billing cycle"
        >
          {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cycle === c}
              onClick={() => setCycle(c)}
              className={`rounded-sm px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                cycle === c ? "bg-navy text-white" : "text-text-secondary hover:text-brand-navy"
              }`}
            >
              {c}
              {c === "yearly" ? (
                <span className="ml-1.5 text-[0.7em] font-bold text-brand-orange">-20%</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3 sm:items-start">
        {TIERS.map((tier) => {
          const isCurrent = activeTier === tier.id;
          const purchasable = isTierPurchasable(tier, cycle);
          const price = tier.price[cycle];

          return (
            <article
              key={tier.id}
              className={`relative overflow-hidden rounded-lg border p-6 transition-transform hover:-translate-y-1 ${
                tier.featured
                  ? "border-navy bg-navy text-white shadow-card sm:-mt-3 sm:pb-8"
                  : "border-border bg-card"
              }`}
            >
              {tier.featured ? (
                <span className="absolute right-4 top-4 rounded-full bg-brand-orange px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                  Popular
                </span>
              ) : null}

              <h2
                className={`text-lg font-semibold uppercase tracking-tight ${
                  tier.featured ? "text-white" : "text-brand-navy"
                }`}
              >
                {tier.name}
              </h2>
              <p
                className={`mt-2 min-h-10 text-sm leading-6 ${
                  tier.featured ? "text-white/70" : "text-text-secondary"
                }`}
              >
                {tier.tagline}
              </p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-serif text-4xl tracking-tight">{formatAmount(price)}</span>
                {price > 0 ? (
                  <span
                    className={`text-xs font-medium ${
                      tier.featured ? "text-white/60" : "text-text-secondary"
                    }`}
                  >
                    /{cycle === "yearly" ? "year" : "month"}
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => choose(tier.id)}
                disabled={
                  isCurrent ||
                  (tier.id !== "grey" && !purchasable) ||
                  checkout.status === "starting"
                }
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  tier.featured
                    ? "bg-brand-orange text-accent-foreground hover:bg-accent-hover"
                    : "bg-navy text-white hover:bg-navy-soft"
                }`}
              >
                {isCurrent
                  ? "Current plan"
                  : tier.id === "grey"
                    ? "Start free"
                    : checkout.status === "starting" && tier.featured
                      ? "Starting checkout"
                      : `Choose ${tier.name}`}
                {!isCurrent ? <ArrowRight className="h-4 w-4" strokeWidth={2} /> : null}
              </button>

              {tier.id !== "grey" && !isCurrent && !purchasable ? (
                <p
                  className={`mt-2 text-center text-[11px] ${
                    tier.featured ? "text-white/60" : "text-text-muted"
                  }`}
                >
                  {tier.liveTier === null
                    ? "This tier opens once the backend supports tier selection."
                    : "Annual billing is not available yet."}
                </p>
              ) : null}

              <ul className="mt-5 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm leading-6">
                    <Check
                      className={`mt-1 h-4 w-4 shrink-0 ${
                        tier.featured ? "text-brand-orange" : "text-accent"
                      }`}
                      strokeWidth={2}
                    />
                    <span className={tier.featured ? "text-white/85" : "text-text-secondary"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {checkout.status === "error" && checkout.error ? (
        <p className="mt-4 text-center text-sm text-error">{checkout.error}</p>
      ) : null}
      {status === "loading" ? (
        <p className="mt-4 text-center text-sm text-text-muted">Checking your membership...</p>
      ) : isSubscriber ? (
        <p className="mt-4 text-center text-sm text-text-secondary">
          You are on Premium.{" "}
          <Link href="/account" className="font-medium text-brand-orange hover:underline">
            Manage your account
          </Link>
        </p>
      ) : null}

      <section className="mt-16 grid gap-8 border-t border-rule pt-10 sm:grid-cols-3">
        {TRUST_POINTS.map((point) => (
          <div key={point.title}>
            <point.icon className="h-5 w-5 text-brand-orange" strokeWidth={1.75} />
            <h3 className="mt-3 font-serif text-lg text-brand-navy">{point.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary">{point.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="text-center font-serif text-2xl text-brand-navy sm:text-3xl">
          Questions, answered
        </h2>
        <Accordion type="single" collapsible className="mx-auto mt-6 max-w-2xl">
          {FAQ.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-sm font-semibold text-brand-navy">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-text-secondary">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Dialog open={gate !== null} onOpenChange={(open) => !open && setGate(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-brand-navy">Sign in to subscribe</DialogTitle>
            <DialogDescription>
              Membership is attached to your reader account, so we need you signed in before taking
              payment.
            </DialogDescription>
          </DialogHeader>
          <button
            type="button"
            onClick={() => router.push("/login?returnTo=%2Fpricing&action=subscribe")}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-soft"
          >
            Continue <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setGate(null)}
            className="text-center text-xs font-medium text-text-secondary hover:text-brand-navy"
          >
            Keep browsing free stories
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
