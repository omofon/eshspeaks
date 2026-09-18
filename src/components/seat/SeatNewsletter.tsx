"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/home/colouresh/SectionHeading";
import { btnRedSm } from "./seatButtons";

const LISTS = [
  {
    name: "The Weekly Circuit",
    desc: "Every Monday, general list, top five political stories of the week",
    defaultChecked: true,
  },
  {
    name: "Fireworks",
    desc: "Every Friday, curated, political intelligence and gossip",
    defaultChecked: false,
  },
  {
    name: "Colouresh Editions",
    desc: "Bi-weekly, general list, Eshomomoh's personal take, signed",
    defaultChecked: false,
  },
  {
    name: "Colouresh Specials",
    desc: "Event-driven, curated, rapid takes on breaking developments",
    defaultChecked: false,
  },
  {
    name: "Colouresh Signals",
    desc: "Weekly, premium, sourced intelligence for active political interests",
    defaultChecked: false,
  },
];

/**
 * `GET /newsletter/lists` / `POST /newsletter/subscribe` are specced (round
 * 2, B2) but not confirmed live, and NewsletterSignup already fakes
 * success today per that doc — same pattern here rather than calling an
 * endpoint that may not exist yet.
 */
export function SeatNewsletter() {
  const [subscribedElection, setSubscribedElection] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(LISTS.map((l) => l.defaultChecked));
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError(true);
      return;
    }
    setError(false);
    setDone(true);
  }

  return (
    <section id="newsletter" className="border-b-2 border-ink bg-[#FDEAE6] py-14 sm:py-20">
      <div className="container-colouresh">
        <SectionHeading
          dot="var(--red)"
          chipLabel="Stay in it"
          title="The Seat, delivered"
          note="One general list, plus curated sends by the sectors you actually care about. Pick what lands in your inbox."
        />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            className="rounded-3xl border-2 border-ink bg-ink p-7 text-white"
            style={{ boxShadow: "6px 6px 0 var(--red)" }}
          >
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-red px-3 py-1.5 text-[11.5px] font-bold">
              <span className="h-[7px] w-[7px] animate-pulse-dot rounded-full bg-white" />
              LIVE 24/7
            </span>
            <h3 className="mb-2.5 text-2xl font-semibold text-white">Election Matters</h3>
            <p className="mb-5 text-sm text-white/75">
              Naija election updates, running continuously through the cycle. The story The Seat is
              driving hardest right now, live coverage plus a dedicated digest for anyone who wants
              the highlights instead of the stream.
            </p>
            <button
              type="button"
              onClick={() => setSubscribedElection(true)}
              disabled={subscribedElection}
              className={`${btnRedSm} ${subscribedElection ? "opacity-80" : ""}`}
            >
              {subscribedElection ? "✓ Subscribed" : "Subscribe to Election Matters"}
            </button>
          </div>

          <div>
            <div className="flex flex-col gap-3.5">
              {LISTS.map((list, i) => (
                <div
                  key={list.name}
                  className="flex items-center justify-between gap-4 rounded-2xl border-2 border-ink bg-white p-4"
                >
                  <div>
                    <strong className="mb-0.5 block text-[15px] text-ink">{list.name}</strong>
                    <span className="text-xs text-ink-soft">{list.desc}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Toggle ${list.name}`}
                    onClick={() => setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)))}
                    className="h-5 w-5 shrink-0 rounded-[6px] border-2 border-ink"
                    style={{ background: checked[i] ? "var(--ink)" : "transparent" }}
                  />
                </div>
              ))}
            </div>

            {done ? (
              <p className="mt-5 py-3 font-semibold text-ink">
                ✓ You&rsquo;re subscribed to the lists you checked above.
              </p>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={error ? "Enter a valid email first…" : "you@email.com"}
                  className={`min-w-[200px] flex-1 rounded-full border-2 px-5 py-3 text-sm outline-none ${
                    error ? "border-red" : "border-ink"
                  }`}
                />
                <button type="button" onClick={submit} className="btn-primary">
                  Sign Me Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
