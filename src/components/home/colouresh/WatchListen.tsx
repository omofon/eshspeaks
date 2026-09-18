"use client";

import { useState } from "react";
import { SectionHeading } from "./SectionHeading";

const VIDEOS = [
  {
    gradient: "linear-gradient(160deg,var(--orange),#7A3B00)",
    dur: "0:42",
    title: "Inside the zoning committee's closed-door week",
  },
  {
    gradient: "linear-gradient(160deg,var(--purple),#2E1966)",
    dur: "1:10",
    title: "What the naira move means for your rent",
  },
  {
    gradient: "linear-gradient(160deg,var(--green),#0F4A22)",
    dur: "0:58",
    title: "Exporters on the corridor paperwork gap",
  },
  {
    gradient: "linear-gradient(160deg,var(--yellow),#8A6300)",
    dur: "1:24",
    title: "On stage at The Seat, Lagos Social",
  },
];

const PODCASTS = [
  {
    gradient: "linear-gradient(150deg,var(--orange),var(--red))",
    title: "Front Bench, Ep. 41",
    desc: "Eshomomoh on the zoning standoff and what it costs the ticket.",
    meta: "34 min",
  },
  {
    gradient: "linear-gradient(150deg,var(--green),var(--yellow))",
    title: "Money Moves Weekly",
    desc: "Reading the forward-contract clearance, plainly.",
    meta: "21 min",
  },
  {
    gradient: "linear-gradient(150deg,var(--purple),var(--orange))",
    title: "Election Matters, Live",
    desc: "Rolling coverage, 24/7 through the cycle.",
    meta: "Listen Live",
  },
];

export function WatchSection() {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <section id="watch" className="container-colouresh py-14 sm:py-16">
      <SectionHeading
        dot="var(--red)"
        chipLabel="Watch"
        title="The story, on screen"
        note="Short-form video, straight from the newsroom floor and the field."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {VIDEOS.map((v, i) => {
          const isPlaying = playing === i;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={isPlaying}
              onClick={() => setPlaying(isPlaying ? null : i)}
              className={`overflow-hidden rounded-2xl border-2 bg-white text-left transition-[border-color] ${
                isPlaying ? "border-red" : "border-ink"
              }`}
            >
              <div
                className="relative flex aspect-[9/12] items-center justify-center"
                style={{ background: v.gradient }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_3px_0_rgba(0,0,0,0.25)]">
                  {isPlaying ? "❚❚" : "▶"}
                </span>
                <span className="absolute bottom-2 right-2 rounded-md bg-ink px-1.5 py-1 text-[10px] font-bold text-white">
                  {isPlaying ? "Playing" : v.dur}
                </span>
              </div>
              <p className="px-3 pb-3.5 pt-2.5 text-[12.5px] font-bold text-ink">{v.title}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ListenSection() {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <section id="listen" className="border-y-2 border-ink bg-paper-2 py-14 sm:py-16">
      <div className="container-colouresh">
        <SectionHeading
          dot="var(--purple)"
          chipLabel="Listen"
          title="The story, out loud"
          note="Podcast conversations that go longer than a headline allows."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {PODCASTS.map((p, i) => {
            const isPlaying = playing === i;
            return (
              <button
                key={i}
                type="button"
                aria-pressed={isPlaying}
                onClick={() => setPlaying(isPlaying ? null : i)}
                className={`flex gap-3.5 rounded-2xl border-2 bg-white p-3.5 text-left transition-[border-color] ${
                  isPlaying ? "border-purple" : "border-ink"
                }`}
              >
                <div className="h-16 w-16 shrink-0 rounded-xl" style={{ background: p.gradient }} />
                <div>
                  <h5 className="text-[14.5px] font-semibold text-ink">{p.title}</h5>
                  <p className="mt-1 text-[11.5px] text-ink-soft">{p.desc}</p>
                  <span className="mt-2 inline-flex text-[11.5px] font-bold text-purple">
                    {isPlaying ? `❚❚ Playing · ${p.meta}` : `▶ Play · ${p.meta}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
