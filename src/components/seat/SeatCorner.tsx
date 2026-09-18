"use client";

import { useState } from "react";
import Link from "next/link";
import { btnOrangeSm, btnOutlineLightSm } from "./seatButtons";

const REACTIONS = ["👍", "❤️", "🔥", "👏"];

/** No /seat/corner endpoint exists yet — static copy, local-only reactions. */
export function SeatCorner() {
  const [showReactions, setShowReactions] = useState(false);
  const [picked, setPicked] = useState<Record<number, boolean>>({});
  const [counts, setCounts] = useState<Record<number, number>>({});

  function pick(i: number) {
    setPicked((prev) => ({ ...prev, [i]: !prev[i] }));
    setCounts((prev) => ({ ...prev, [i]: (prev[i] ?? 0) + (picked[i] ? -1 : 1) }));
  }

  return (
    <section className="bg-ink py-14 text-white sm:py-20">
      <div className="container-colouresh">
        <div className="grid items-center gap-9 sm:grid-cols-[200px_1fr]">
          <div
            className="h-[180px] w-[180px] rounded-3xl p-[5px]"
            style={{
              background:
                "conic-gradient(from 180deg, var(--orange), var(--red), var(--purple), var(--green), var(--yellow), var(--orange))",
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-ink text-center font-serif text-sm text-white/60">
              Eshomomoh
              <br />
              Imoudu
            </div>
          </div>
          <div>
            <span className="chip border-white/20 bg-white/10 text-white">
              <span className="inline-block h-2 w-2 rounded-full bg-orange" />
              Eshomomoh&rsquo;s Corner
            </span>
            <h3 className="mt-3 text-[27px] font-semibold text-white">
              A seat at the table isn&rsquo;t given, it&rsquo;s taken.
            </h3>
            <p className="mt-2.5 max-w-[560px] text-[15.5px] text-white/70">
              My own take on what&rsquo;s moving this week, pinned so it doesn&rsquo;t get lost in
              the feed. This is where I say what I actually think, not what&rsquo;s safe to say.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/thread/housing-policy" className={btnOrangeSm}>
                Reply to Eshomomoh
              </Link>
              <button
                type="button"
                onClick={() => setShowReactions((v) => !v)}
                className={btnOutlineLightSm}
              >
                {showReactions ? "Hide" : "React"}
              </button>
            </div>
            {showReactions ? (
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                {REACTIONS.map((emoji, i) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => pick(i)}
                    className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-sm ${
                      picked[i] ? "border-orange-deep bg-orange" : "border-white/25 bg-white/10"
                    }`}
                  >
                    {emoji} <b>{counts[i] ?? 0}</b>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
