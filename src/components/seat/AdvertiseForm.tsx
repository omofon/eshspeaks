"use client";

import { useState, type FormEvent } from "react";
import { LeadFormConfirm } from "./LeadFormConfirm";

const SLOTS = [
  { title: "Leaderboard", sub: "Top of section pages" },
  { title: "In-feed native", sub: "Between story cards" },
  { title: "Sidebar", sub: "Article & section pages" },
  { title: "Topic / Spotlight sponsorship", sub: "The Seat" },
];

/** No /ads endpoint for enquiries is confirmed live (round 1 S4.1 covers
 *  serving ad slots, not this enquiry form) — confirms locally. */
export function AdvertiseForm() {
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    return (
      <LeadFormConfirm
        accent="var(--red)"
        title="Enquiry sent"
        description="Someone from the Colouresh commercial team will follow up within two business days with placements and rates."
        backHref="/"
        backLabel="Back to the Front Desk"
      />
    );
  }

  return (
    <div>
      <span className="chip">
        <span className="inline-block h-2 w-2 rounded-full bg-red" />
        Advertising
      </span>
      <h1 className="mb-2 mt-3.5 text-[32px] font-semibold text-ink">Advertise on Colouresh</h1>
      <p className="mb-7 max-w-[480px] text-[14.5px] text-ink-soft">
        Reach readers where the conversation is already happening, topic sponsorship, spotlight
        sponsorship, in-feed placements, or a desk sponsorship on State of Play, The Bag, or Money
        Moves.
      </p>

      <div className="mb-7 grid grid-cols-2 gap-3">
        {SLOTS.map((slot) => (
          <div key={slot.title} className="rounded-2xl border-2 border-line bg-white p-4">
            <strong className="mb-1 block text-[13.5px] text-ink">{slot.title}</strong>
            <span className="text-xs text-ink-soft">{slot.sub}</span>
          </div>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border-2 border-ink bg-white p-7"
        style={{ boxShadow: "6px 6px 0 var(--red)" }}
      >
        <label className="mb-1.5 block text-xs font-bold text-ink">Full name</label>
        <input
          type="text"
          required
          placeholder="Your name"
          className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        />
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Email</label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Company / brand</label>
            <input
              type="text"
              required
              placeholder="Company name"
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">
          Where do you want to appear?
        </label>
        <select
          required
          defaultValue=""
          className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        >
          <option value="" disabled>
            Select a placement
          </option>
          <option>Front Desk leaderboard</option>
          <option>State of Play</option>
          <option>The Bag</option>
          <option>Money Moves</option>
          <option>The Seat, topic sponsorship</option>
          <option>The Seat, event sponsorship</option>
          <option>Not sure, advise me</option>
        </select>

        <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">Monthly budget range</label>
        <select
          defaultValue=""
          className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        >
          <option value="">Prefer not to say</option>
          <option>Under ₦500,000</option>
          <option>₦500,000 – ₦2,000,000</option>
          <option>₦2,000,000 – ₦5,000,000</option>
          <option>₦5,000,000+</option>
        </select>

        <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">
          Anything else we should know?
        </label>
        <textarea
          placeholder="Campaign goals, timing, creative you already have..."
          className="min-h-[90px] w-full resize-y rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        />

        <div className="mt-5.5 flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            style={{ background: "var(--red)", boxShadow: "0 4px 0 var(--red-deep)" }}
          >
            Submit Enquiry
          </button>
        </div>
      </form>
    </div>
  );
}
