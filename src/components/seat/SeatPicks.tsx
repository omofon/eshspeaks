"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/data/types";
import { articleHref } from "@/components/home/primitives";
import { SectionHeading } from "@/components/home/colouresh/SectionHeading";

const TREND_TABS: { label: string; rows: [string, string][] }[] = [
  {
    label: "The Seat",
    rows: [
      ["#HousingReform2026", "↑ 34%"],
      ["Election Matters live", "↑ 28%"],
      ["Fuel subsidy talks", "↑ 22%"],
      ["State of Play: Kano", "↑ 19%"],
      ["Naira watch", "↑ 11%"],
    ],
  },
  {
    label: "Social",
    rows: [
      ["#RichPlateau", "↑ 41%"],
      ["Trending: Afrobeats x Soca", "↑ 30%"],
      ["#NaijaVotes2027", "↑ 25%"],
      ["Fashion week reactions", "↑ 14%"],
      ["Football transfer talk", "↑ 9%"],
    ],
  },
  {
    label: "News",
    rows: [
      ["Budget defense hearing", "↑ 37%"],
      ["Border security report", "↑ 26%"],
      ["Central bank rate decision", "↑ 20%"],
      ["New housing bill", "↑ 17%"],
      ["Diaspora remittance data", "↑ 8%"],
    ],
  },
];

const PICK_COLORS = ["var(--orange)", "var(--green)", "var(--purple)"];

/** Editor's picks reads the real "the-seat" subsegment feed (see page.tsx);
 *  the trending sidebar has no backing endpoint yet (B5 in
 *  CMS-BACKEND-REQUESTS-2 — trending is client-sorted mocks today, not a
 *  real feed) so it stays static, same as the prototype. */
export function SeatPicks({ articles }: { articles: Article[] }) {
  const [tab, setTab] = useState(0);
  const picks = articles.slice(0, 3);

  return (
    <section id="picks" className="py-14 sm:py-20">
      <div className="container-colouresh">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <SectionHeading
              dot="var(--orange)"
              chipLabel="Editor's picks"
              title="If you read nothing else"
            />
            {picks.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing filed here yet, check back soon.</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {picks.map((article, i) => (
                  <Link
                    key={article.slug}
                    href={articleHref(article)}
                    className="overflow-hidden rounded-xl border-2 border-ink bg-white"
                  >
                    <div
                      className="relative aspect-[16/10]"
                      style={{ background: `linear-gradient(150deg,${PICK_COLORS[i % 3]},#fff)` }}
                    >
                      <span className="absolute bottom-2.5 left-3 rounded-full border-2 border-ink bg-white px-2.5 py-1 text-[11px] font-bold">
                        {article.sectionName ?? "The Seat"}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="mb-2.5 text-base leading-[1.35] font-bold text-ink">
                        {article.title}
                      </h4>
                      <div className="flex justify-between text-xs font-semibold text-ink-soft">
                        <span>{article.commentCount} comments</span>
                        <span>{article.byline}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="sticky top-[88px] h-fit rounded-2xl border-2 border-ink bg-white p-5">
            <div className="mb-3 flex gap-3.5 border-b-2 border-line text-[12.5px]">
              {TREND_TABS.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setTab(i)}
                  className={`pb-2.5 font-bold ${
                    tab === i ? "border-b-[3px] border-orange text-ink" : "text-ink-soft"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {TREND_TABS[tab]!.rows.map(([label, delta]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-line py-2.5 text-[13px] last:border-b-0"
              >
                <span>{label}</span>
                <span className="text-[11.5px] font-bold text-green-deep">{delta}</span>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
