"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SEAT_TOPICS, countReplies, initialsFor } from "@/lib/data/seatTopics";
import { btnPurpleSm, btnGhostSm } from "./seatButtons";

const SORTS = [
  { key: "active", label: "Most Active" },
  { key: "followed", label: "Most Followed" },
  { key: "new", label: "Newest" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

const CATEGORIES = ["All", ...Array.from(new Set(SEAT_TOPICS.map((t) => t.category)))];

export function TopicsBrowser() {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("active");
  const [search, setSearch] = useState("");

  const topics = useMemo(() => {
    let list = SEAT_TOPICS.filter(
      (t) =>
        (category === "All" || t.category === category) &&
        t.title.toLowerCase().includes(search.toLowerCase()),
    );
    list = [...list];
    if (sort === "active") list.sort((a, b) => a.order - b.order);
    if (sort === "followed") list.sort((a, b) => b.followers - a.followers);
    if (sort === "new") list.sort((a, b) => b.order - a.order);
    return list;
  }, [category, sort, search]);

  return (
    <div>
      <div className="mb-3.5">
        <span className="chip">
          <span className="inline-block h-2 w-2 rounded-full bg-purple" />
          The Seat
        </span>
      </div>
      <h1 className="mb-2 text-[32px] font-semibold text-ink">All Topics</h1>
      <p className="mb-7 max-w-[520px] text-[14.5px] text-ink-soft">
        Every conversation currently open on the floor. Follow one, reply to one, or start your own.
      </p>

      <div
        className="mb-7 flex flex-wrap items-center justify-between gap-5 rounded-[20px] border-2 border-ink bg-[#F1EBFF] p-6"
        style={{ boxShadow: "6px 6px 0 var(--purple)" }}
      >
        <div>
          <h4 className="mb-1.5 text-lg font-semibold text-ink">Don&rsquo;t see your take here?</h4>
          <p className="text-[13px] text-ink-soft">
            Put your own question or opinion on the floor and see who shows up.
          </p>
        </div>
        <Link href="/the-seat#composer-anchor" className={btnPurpleSm}>
          + Start a Topic
        </Link>
      </div>

      <div className="mb-7">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics..."
          className="w-full rounded-full border-2 border-ink px-5 py-3 text-sm outline-none"
        />
      </div>

      <div className="mb-6.5 flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border-2 border-ink px-4 py-2 text-[12.5px] font-bold ${
                category === cat ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border-2 border-line bg-white p-[3px]">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                sort === s.key ? "bg-purple text-white" : "text-ink-soft"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="py-16 text-center text-ink-soft">
          No topics match that search yet.{" "}
          <Link href="/the-seat#composer-anchor" className="font-bold text-purple">
            Start one?
          </Link>
        </div>
      ) : (
        <div>
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/thread/${topic.id}`}
              className="mb-3.5 flex flex-wrap items-center justify-between gap-5 rounded-2xl border-2 border-ink bg-white p-5 transition-transform hover:translate-x-1"
            >
              <div className="min-w-[240px] flex-1">
                <div className="mb-2 text-[10.5px] font-bold" style={{ color: topic.color }}>
                  {topic.tag} · {topic.category}
                </div>
                <h3 className="mb-2.5 text-[17px] leading-[1.35] font-semibold text-ink">
                  {topic.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-ink-soft">
                  <span>{countReplies(topic)} replies</span>
                  <span>{topic.followers.toLocaleString()} following</span>
                  <span>Active {topic.lastActive}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2.5">
                <span
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
                  style={{ background: topic.color }}
                >
                  {initialsFor(topic.startedBy)}
                </span>
                <span className={btnGhostSm}>Open Thread</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
