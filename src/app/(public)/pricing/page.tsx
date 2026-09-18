"use client";

import { useState, type CSSProperties } from "react";
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
    body: "Membership is for people who read Colouresh regularly, not a paywall dressed up as a growth trick.",
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

const TIER_LOOKS: Record<TierId, { card: string; style?: CSSProperties; btn: string }> = {
  grey: { card: "border-2 border-ink bg-white text-ink", btn: "btn-ghost" },
  slate: {
    card: "border-2 border-purple-deep text-white",
    style: { background: "linear-gradient(160deg,#8A5CF0,#5E33C4)" },
    btn: "btn-primary",
  },
  bold: {
    card: "relative overflow-hidden border-2 border-ink bg-ink text-white",
    btn: "btn-accent",
  },
};

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
    <div className="container-colouresh mx-auto max-w-5xl py-10 sm:py-14">
      <header className="text-center">
        <span className="chip">
          <span className="inline-block h-2 w-2 rounded-full bg-purple" />
          Our membership
        </span>
        <h1 className="mx-auto mt-3.5 max-w-2xl text-[32px] font-semibold leading-tight text-ink sm:text-[40px]">
          Simple membership for every kind of reader
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-ink-soft">
          Three tiers on The List. Start free, move up when the reporting earns it.
        </p>
      </header>

      <div className="mt-7 flex justify-center">
        <div
          className="inline-flex gap-1 rounded-full border-2 border-ink bg-white p-1"
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
              className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                cycle === c ? "bg-ink text-white" : "text-ink-soft"
              }`}
            >
              {c}
              {c === "yearly" ? (
                <span className="ml-1.5 text-[0.7em] font-bold text-orange">-20%</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-9 grid gap-5 sm:grid-cols-3 sm:items-start">
        {TIERS.map((tier) => {
          const isCurrent = activeTier === tier.id;
          const purchasable = isTierPurchasable(tier, cycle);
          const price = tier.price[cycle];
          const look = TIER_LOOKS[tier.id];

          return (
            <article
              key={tier.id}
              className={`flex min-h-[420px] flex-col rounded-3xl p-6 transition-transform hover:-translate-y-1 ${look.card} ${tier.featured ? "sm:-mt-3 sm:pb-9" : ""}`}
              style={look.style}
            >
              {tier.id === "bold" ? (
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.14]"
                  style={{
                    background:
                      "conic-gradient(from 90deg, var(--orange), var(--red), var(--purple), var(--green), var(--yellow), var(--orange))",
                  }}
                />
              ) : null}

              {tier.featured ? (
                <span className="relative z-[1] mb-3 w-fit rounded-full bg-orange px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Popular
                </span>
              ) : null}

              <span className="relative z-[1] mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide opacity-60">
                The List
              </span>
              <h2
                className={`relative z-[1] font-serif text-2xl ${tier.id === "grey" ? "text-ink" : "text-white"}`}
              >
                {tier.name}
              </h2>
              <p className="relative z-[1] mt-2 min-h-10 text-sm leading-6 opacity-80">
                {tier.tagline}
              </p>

              <div className="relative z-[1] mt-4 flex items-baseline gap-1.5">
                <span className="font-serif text-4xl tracking-tight">{formatAmount(price)}</span>
                {price > 0 ? (
                  <span className="text-xs font-medium opacity-70">
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
                className={`${look.btn} relative z-[1] mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60`}
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
                <p className="relative z-[1] mt-2 text-center text-[11px] opacity-70">
                  {tier.liveTier === null
                    ? "This tier opens once the backend supports tier selection."
                    : "Annual billing is not available yet."}
                </p>
              ) : null}

              <ul className="relative z-[1] mt-5 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm leading-6">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-orange" strokeWidth={2} />
                    <span className="opacity-90">{f}</span>
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
        <p className="mt-4 text-center text-sm text-ink-soft">Checking your membership...</p>
      ) : isSubscriber ? (
        <p className="mt-4 text-center text-sm text-ink-soft">
          You are on Premium.{" "}
          <Link href="/account" className="font-semibold text-orange hover:underline">
            Manage your account
          </Link>
        </p>
      ) : null}

      <section className="mt-16 grid gap-8 border-t-2 border-line pt-10 sm:grid-cols-3">
        {TRUST_POINTS.map((point) => (
          <div key={point.title}>
            <point.icon className="h-5 w-5 text-orange" strokeWidth={1.75} />
            <h3 className="mt-3 text-lg font-semibold text-ink">{point.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-ink-soft">{point.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">
          Questions, answered
        </h2>
        <Accordion type="single" collapsible className="mx-auto mt-6 max-w-2xl">
          {FAQ.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-line">
              <AccordionTrigger className="text-left text-sm font-semibold text-ink">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-ink-soft">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Dialog open={gate !== null} onOpenChange={(open) => !open && setGate(null)}>
        <DialogContent className="max-w-sm rounded-2xl border-2 border-ink">
          <DialogHeader>
            <DialogTitle className="text-ink">Sign in to subscribe</DialogTitle>
            <DialogDescription>
              Membership is attached to your reader account, so we need you signed in before taking
              payment.
            </DialogDescription>
          </DialogHeader>
          <button
            type="button"
            onClick={() => router.push("/login?returnTo=%2Fpricing&action=subscribe")}
            className="btn-primary mt-1 w-full"
          >
            Continue <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setGate(null)}
            className="text-center text-xs font-semibold text-ink-soft hover:text-ink"
          >
            Keep browsing free stories
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
