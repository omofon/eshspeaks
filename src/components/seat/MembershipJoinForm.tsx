"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const TIERS = ["Grey", "Slate", "Bold"] as const;
type Tier = (typeof TIERS)[number];

function isTier(value: string | undefined): value is Tier {
  return !!value && (TIERS as readonly string[]).includes(value);
}

/**
 * This mirrors membership.html verbatim: a standalone lead-capture form,
 * not the real membership/checkout system at /pricing (Grey/Slate/Bold
 * there are real, Paystack-backed tiers). Submitting here only confirms
 * locally, same as the prototype — it does not create an account or a
 * subscription. See /pricing for the real join flow.
 */
export function MembershipJoinForm({ initialTier }: { initialTier?: string | undefined }) {
  const [tier, setTier] = useState<Tier>(isTier(initialTier) ? initialTier : "Grey");
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4.5 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-purple">
          <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-semibold text-ink">Welcome to The List, {tier}</h2>
        <p className="mx-auto mt-3 max-w-sm text-[14.5px] text-ink-soft">
          Your membership card and next steps are on their way to your email.
        </p>
        <Link href="/the-seat" className="btn-ghost mt-6 inline-flex">
          Back to The Seat
        </Link>
      </div>
    );
  }

  return (
    <div>
      <span className="chip">
        <span className="inline-block h-2 w-2 rounded-full bg-purple" />
        Community
      </span>
      <h1 className="mb-2 mt-3.5 text-[30px] font-semibold text-ink">Join The List</h1>
      <p className="mb-6.5 text-[14.5px] text-ink-soft">
        Network, get invited, get in the right room.
      </p>

      <div className="mb-5.5 flex flex-wrap gap-2">
        {TIERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={`rounded-full border-2 border-ink px-4 py-2.5 text-[13px] font-bold ${
              tier === t ? "bg-ink text-white" : "bg-white text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border-2 border-ink bg-white p-7"
        style={{ boxShadow: "6px 6px 0 var(--purple)" }}
      >
        <label className="mb-1.5 block text-xs font-bold text-ink">Full name</label>
        <input
          type="text"
          required
          placeholder="Your name"
          className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none focus:border-purple"
        />
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Email</label>
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none focus:border-purple"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Phone</label>
            <input
              type="tel"
              placeholder="+234..."
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none focus:border-purple"
            />
          </div>
        </div>
        <div className="mt-5.5 flex justify-end">
          <button type="submit" className="btn-purple">
            Join {tier}
          </button>
        </div>
      </form>
    </div>
  );
}
