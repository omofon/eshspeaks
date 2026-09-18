"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/home/colouresh/SectionHeading";

const SPOTLIGHTS = [
  {
    kicker: "COMMUNITY SPOTLIGHT",
    name: "Ada Eze",
    desc: "340 replies this month, State of Play regular.",
    likes: 128,
    g1: "var(--orange)",
    g2: "#FFB37A",
  },
  {
    kicker: "VOICE SPOTLIGHT",
    name: "Dr. Femi Adisa",
    desc: "Policy economist, weekly on Policy Desk.",
    likes: 96,
    g1: "var(--purple)",
    g2: "#C6ACFA",
  },
  {
    kicker: "COMMUNITY SPOTLIGHT",
    name: "Kelechi Obi",
    desc: "Started the housing thread that hit 1,200 replies.",
    likes: 211,
    g1: "var(--yellow)",
    g2: "#FFE49B",
  },
  {
    kicker: "VOICE SPOTLIGHT",
    name: "Chioma Nwosu",
    desc: "Security analyst, Border and Maritime.",
    likes: 74,
    g1: "var(--red)",
    g2: "#F5A69A",
  },
];

function copyLink() {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(window.location.href);
  }
}

/** No /seat/spotlights endpoint yet — static cards, local-only likes. */
function Spotlights() {
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  function toggle(i: number, base: number) {
    setLiked((prev) => ({ ...prev, [i]: !prev[i] }));
    setLikes((prev) => ({ ...prev, [i]: (prev[i] ?? base) + (liked[i] ? -1 : 1) }));
  }

  return (
    <section id="spotlights" className="border-y-2 border-ink bg-green-bg py-14 sm:py-20">
      <div className="container-colouresh">
        <SectionHeading
          dot="var(--green)"
          chipLabel="Spotlights"
          title="The people behind the takes"
          note="A member, a contributor, or a guest voice, alternating weekly. Like or share a spotlight to help it travel."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {SPOTLIGHTS.map((s, i) => (
            <div key={s.name} className="overflow-hidden rounded-2xl border-2 border-ink bg-white">
              <div
                className="aspect-square"
                style={{ background: `linear-gradient(160deg,${s.g1},${s.g2})` }}
              />
              <div className="p-4">
                <div className="mb-1.5 text-[11px] font-bold text-green-deep">{s.kicker}</div>
                <h5 className="mb-1 text-[15.5px] font-bold text-ink">{s.name}</h5>
                <p className="mb-2.5 text-xs text-ink-soft">{s.desc}</p>
                <div className="flex gap-3.5 text-xs font-semibold text-ink-soft">
                  <button
                    type="button"
                    onClick={() => toggle(i, s.likes)}
                    className="flex items-center gap-1"
                  >
                    ♥ {likes[i] ?? s.likes}
                  </button>
                  <button type="button" onClick={copyLink} className="flex items-center gap-1">
                    ↗ Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PARTNERSHIPS = [
  {
    flag: "Nigeria × Trinidad & Tobago",
    title: "Tourism exchange campaign",
    desc: "A cultural bridge built through the same appetite for open conversation, brought to both audiences.",
    more: "Built on the April 2025 Nigeria–T&T aviation agreement. Colouresh produces the Same Rhythm content series and hosts a Seat, Live edition around Carnival season.",
    gradient: "linear-gradient(145deg,var(--orange),var(--red))",
  },
  {
    flag: "Nigeria × Ghana",
    title: "Creative economy dialogue",
    desc: "Shared spotlight series between West African voices on culture and commerce.",
    more: "A recurring cross-listing arrangement with Ghanaian creative-economy voices, spotlighted on Colouresh and syndicated back to Accra-based platforms.",
    gradient: "linear-gradient(145deg,var(--purple),var(--purple-deep))",
  },
  {
    flag: "Nigeria × Diaspora UK",
    title: "The Seat, London edition",
    desc: "Bringing the physical gathering format to the diaspora community abroad.",
    more: "Quarterly London gatherings for the Nigerian diaspora, same stage-interview format as Lagos and Abuja, announced first to The List members.",
    gradient: "linear-gradient(145deg,var(--green),var(--green-deep))",
  },
];

/** No /seat/partnerships endpoint yet — static cards, local expand toggle. */
function Partnerships() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  return (
    <section className="bg-ink py-14 sm:py-20">
      <div className="container-colouresh">
        <SectionHeading
          inverted
          dot="var(--yellow)"
          chipLabel="Beyond Nigeria"
          title="Cross-border, cross-cultural"
          note="Brand collaborations that carry The Seat's conversation past one border."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {PARTNERSHIPS.map((p, i) => (
            <div
              key={p.title}
              className="flex min-h-[230px] flex-col gap-3.5 rounded-3xl p-7 text-white"
              style={{ background: p.gradient }}
            >
              <span className="w-fit rounded-full bg-white/20 px-3 py-1.5 text-[11.5px] font-bold">
                {p.flag}
              </span>
              <h4 className="text-xl font-semibold text-white">{p.title}</h4>
              <p className="text-[13.5px] leading-relaxed opacity-90">{p.desc}</p>
              {expanded[i] ? <p className="text-[12.5px] opacity-85">{p.more}</p> : null}
              <button
                type="button"
                onClick={() => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                className="mt-auto flex items-center gap-1.5 text-[13px] font-bold"
              >
                {expanded[i] ? "Show less ←" : "Learn more →"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeatCommunity() {
  return (
    <>
      <Spotlights />
      <Partnerships />
    </>
  );
}
