"use client";

import { useState, type FormEvent } from "react";
import { LeadFormConfirm } from "./LeadFormConfirm";

const EVENTS = [
  { value: "lagos", label: "The Seat: Lagos Social, 14 Oct, Victoria Island" },
  { value: "abuja", label: "The Seat: Abuja Roundtable, 2 Nov, Central Business District" },
  { value: "ph", label: "The Seat: Port Harcourt Mixer, 21 Nov, GRA Phase 2" },
];

/** No /seat/events/{id}/request-invite endpoint exists yet — confirms
 *  locally, same pattern as the rest of The Seat's forms. */
export function RsvpForm({ initialEvent }: { initialEvent?: string | undefined }) {
  const defaultEvent = EVENTS.some((e) => e.value === initialEvent) ? initialEvent! : "lagos";
  const [event, setEvent] = useState(defaultEvent);
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    const label = EVENTS.find((e) => e.value === event)!.label.split(",")[0];
    return (
      <LeadFormConfirm
        accent="var(--orange)"
        title={`You're on the list for ${label}`}
        description="A confirmation with the exact address and time is on its way to your email."
        backHref="/the-seat#events"
        backLabel="Back to The Seat"
      />
    );
  }

  return (
    <div>
      <span className="chip">
        <span className="inline-block h-2 w-2 rounded-full bg-orange" />
        The Seat, Live
      </span>
      <h1 className="mb-2 mt-3.5 text-[30px] font-semibold text-ink">Request an Invite</h1>
      <p className="mb-6.5 text-[14.5px] text-ink-soft">
        Free to attend, spaces are limited, so we ask for an RSVP to plan the room.
      </p>

      <form
        onSubmit={submit}
        className="rounded-2xl border-2 border-ink bg-white p-7"
        style={{ boxShadow: "6px 6px 0 var(--orange)" }}
      >
        <label className="mb-1.5 block text-xs font-bold text-ink">Which event?</label>
        <select
          required
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        >
          {EVENTS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Full name</label>
            <input
              type="text"
              required
              placeholder="Your name"
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">Email</label>
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">
          Phone (for entry confirmation)
        </label>
        <input
          type="tel"
          required
          placeholder="+234..."
          className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
        />

        <label className="mb-1.5 mt-4 block text-xs font-bold text-ink">Guests joining you</label>
        <select className="w-full rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none">
          <option>Just me</option>
          <option>+1</option>
          <option>+2</option>
          <option>+3 or more</option>
        </select>

        <div className="mt-5.5 flex justify-end">
          <button type="submit" className="btn-accent">
            Confirm RSVP
          </button>
        </div>
      </form>
    </div>
  );
}
