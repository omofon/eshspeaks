"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/home/colouresh/SectionHeading";
import { btnOrangeSm, btnOutlineLightSm } from "./seatButtons";

const EVENTS = [
  {
    title: "The Seat: Lagos Social",
    loc: "Victoria Island, Lagos",
    format: "Stage interviews + open floor",
    d: "14",
    m: "OCT",
    slug: "lagos",
  },
  {
    title: "The Seat: Abuja Roundtable",
    loc: "Central Business District, Abuja",
    format: "Stage interviews + panel",
    d: "02",
    m: "NOV",
    slug: "abuja",
  },
  {
    title: "The Seat: Port Harcourt Mixer",
    loc: "GRA Phase 2, Port Harcourt",
    format: "Open floor + networking",
    d: "21",
    m: "NOV",
    slug: "ph",
  },
];

const GALLERY = [
  { cap: "On stage", g1: "var(--orange)", g2: "#7A3B00" },
  { cap: "The room", g1: "var(--purple)", g2: "#2E1966" },
  { cap: "Meet & talk", g1: "var(--green)", g2: "#0F4A22" },
  { cap: "Take the Seat", g1: "var(--yellow)", g2: "#8A6300" },
];

const HOW_IT_WORKS = [
  {
    step: "1. Nominate.",
    body: "Anyone can nominate a community member or someone new, with a line on why they'd make a good conversation.",
  },
  {
    step: "2. Producers review.",
    body: "The Seat's producers shortlist nominees ahead of each event based on fit and availability.",
  },
  {
    step: "3. A quick pre-chat.",
    body: "Selected guests get a short call beforehand to map the conversation, no scripts, just direction.",
  },
  {
    step: "4. On stage, live.",
    body: "A guided 10 to 15 minute interview in front of the room, then open floor Q&A.",
  },
];

/** No /seat/events endpoint yet — static event list; RSVP/nominate/gallery
 *  links point at their own not-yet-built pages, same phased-rollout
 *  pattern as the rest of this rebuild. */
export function SeatEvents() {
  const [howItWorks, setHowItWorks] = useState(false);

  return (
    <section id="events" className="bg-ink py-14 text-white sm:py-20">
      <div className="container-eshspeaks">
        <SectionHeading
          inverted
          dot="var(--orange)"
          chipLabel="The Seat, Live"
          title="Take a real seat"
          note="The same conversation, in a room, with the volume turned up."
        />

        <div className="mb-12 grid overflow-hidden rounded-3xl border-2 border-white/15 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-3.5 p-8">
            <span className="chip w-fit border-white/20 bg-white/10 text-white">
              <span className="inline-block h-2 w-2 rounded-full bg-red" />
              On stage
            </span>
            <h3 className="text-[26px] font-semibold text-white">
              The audience isn&rsquo;t just watching, they&rsquo;re on the mic.
            </h3>
            <p className="text-[14.5px] text-white/70">
              Every Seat, Live event puts real members of the audience on stage for a guided
              interview: their view, their story, live in front of the room. It&rsquo;s the physical
              version of what happens in the comment threads, except now the room hears it, reacts
              to it, and carries it home.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/nominate" className={btnOrangeSm}>
                Nominate a Guest
              </Link>
              <button
                type="button"
                onClick={() => setHowItWorks((v) => !v)}
                className={btnOutlineLightSm}
              >
                How Stage Interviews Work
              </button>
            </div>
            {howItWorks ? (
              <div className="rounded-2xl border-2 border-white/20 bg-white/[0.06] p-4.5 text-[13px] text-white/85">
                {HOW_IT_WORKS.map((item) => (
                  <div key={item.step} className="mb-2.5 last:mb-0">
                    <strong className="text-yellow">{item.step}</strong> {item.body}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div
            className="min-h-[280px]"
            style={{ background: "linear-gradient(160deg,#2A1F52,#141024)" }}
          >
            <svg viewBox="0 0 400 280" className="h-full w-full">
              <ellipse cx="200" cy="250" rx="180" ry="18" fill="#000" opacity=".3" />
              <rect x="60" y="150" width="280" height="14" rx="7" fill="var(--orange)" />
              <circle cx="150" cy="120" r="26" fill="var(--yellow)" />
              <rect x="132" y="146" width="36" height="60" rx="12" fill="var(--purple)" />
              <circle cx="250" cy="120" r="26" fill="var(--green)" />
              <rect x="232" y="146" width="36" height="60" rx="12" fill="var(--red)" />
              <rect x="192" y="90" width="16" height="90" rx="6" fill="#fff" opacity=".85" />
              <circle cx="200" cy="82" r="14" fill="#fff" opacity=".85" />
              <g opacity=".5">
                <circle cx="70" cy="230" r="10" fill="var(--purple)" />
                <circle cx="100" cy="235" r="10" fill="var(--orange)" />
                <circle cx="130" cy="230" r="10" fill="var(--yellow)" />
                <circle cx="270" cy="230" r="10" fill="var(--green)" />
                <circle cx="300" cy="235" r="10" fill="var(--red)" />
                <circle cx="330" cy="230" r="10" fill="var(--purple)" />
              </g>
            </svg>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            {EVENTS.map((event) => (
              <Link
                key={event.slug}
                href={`/rsvp?event=${event.slug}`}
                className="mb-3.5 flex items-center justify-between gap-4 rounded-2xl border-2 border-white/20 p-4.5"
              >
                <div>
                  <div className="mb-1 text-[15.5px] font-bold text-white">{event.title}</div>
                  <div className="text-xs text-white/50">{event.loc}</div>
                  <div className="mt-1 text-[11px] font-bold text-yellow">{event.format}</div>
                </div>
                <div className="min-w-[56px] rounded-xl bg-orange px-3.5 py-2 text-center">
                  <div className="font-serif text-[19px] leading-none">{event.d}</div>
                  <div className="text-[9.5px] font-bold">{event.m}</div>
                </div>
              </Link>
            ))}
            <Link href="/rsvp?event=lagos" className={`${btnOrangeSm} mt-1.5`}>
              Request an Invite
            </Link>
          </div>

          <div>
            <div className="mb-3 text-xs font-bold text-white/50">FROM THE LAST GATHERING</div>
            <div className="grid grid-cols-2 gap-3.5">
              {GALLERY.map((tile) => (
                <div
                  key={tile.cap}
                  className="relative aspect-square overflow-hidden rounded-2xl border-2 border-white/15"
                  style={{ background: `linear-gradient(150deg,${tile.g1},${tile.g2})` }}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 px-3 py-2.5 text-[11px] font-bold"
                    style={{ background: "linear-gradient(0deg, rgba(0,0,0,.7), transparent)" }}
                  >
                    {tile.cap}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/gallery" className={`${btnOutlineLightSm} mt-4`}>
              See Full Gallery
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
