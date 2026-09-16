"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/home/colouresh/SectionHeading";
import { btnGhostSm, btnPurpleSm, btnWhiteSm } from "./seatButtons";

const TAGS = [
  { label: "Politics", color: "var(--orange)" },
  { label: "Security", color: "var(--red)" },
  { label: "Business", color: "var(--green)" },
  { label: "Entertainment", color: "var(--purple)" },
  { label: "Sports", color: "var(--green)" },
  { label: "Tech", color: "var(--purple)" },
];

const COMING_UP = [
  {
    title: "Security Watch: who's accountable for border gaps?",
    when: "MON",
    href: "/thread/border-gaps",
  },
  {
    title: "Community-submitted: naira strength, real or PR?",
    when: "WED",
    href: "/thread/naira-strength",
  },
  {
    title: "Tied to the news: budget defense reactions",
    when: "FRI",
    href: "/thread/budget-defense",
  },
];

/**
 * No /seat/topics endpoint exists yet (see CMS-BACKEND-REQUESTS-2 B1), so
 * "What's on the floor" is static marketing content and the composer below
 * only confirms locally rather than posting anywhere — same honest-local
 * pattern as NewsletterSignup, not a fake submission to a queue that isn't
 * real yet.
 */
export function SeatTopics() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1204);
  const [selectedTag, setSelectedTag] = useState("Politics");
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleLike() {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
  }

  return (
    <section id="topics" className="bg-paper-2 border-b-2 border-ink py-14 sm:py-20">
      <div className="container-eshspeaks">
        <SectionHeading
          dot="var(--yellow-deep)"
          chipLabel="This week"
          title="What's on the floor"
          note="Set by Eshomomoh, pulled from breaking news, or raised by the community. Whatever's live gets the floor, and follows show what's building momentum before it peaks."
        />
        <div className="-mt-3.5 mb-6.5">
          <Link href="/topics" className={btnGhostSm}>
            Browse All Topics →
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div
            className="flex flex-col gap-4 rounded-[20px] border-2 border-ink bg-white p-7"
            style={{ boxShadow: "6px 6px 0 var(--yellow-deep)" }}
          >
            <span className="text-xs font-bold text-yellow-deep">SET BY ESHOMOMOH</span>
            <h3 className="text-[23px] leading-[1.3] font-semibold text-ink">
              Is the new housing policy built for people who actually need it, or for the headlines?
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-line pt-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                <div className="flex">
                  {["A", "K", "T"].map((initial, i) => (
                    <span
                      key={initial}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                      style={{
                        background: ["var(--orange)", "var(--purple)", "var(--green)"][i],
                        marginLeft: i === 0 ? 0 : "-8px",
                      }}
                    >
                      {initial}
                    </span>
                  ))}
                </div>
                {likeCount.toLocaleString()} following
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={toggleLike}
                  className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-2 text-[13px] font-semibold ${
                    liked ? "bg-[var(--orange-liked)] border-orange" : "bg-white"
                  }`}
                >
                  ♥ {likeCount.toLocaleString()}
                </button>
                <Link href="/thread/housing-policy" className={btnGhostSm}>
                  Join the Conversation
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border-2 border-ink bg-ink p-6 text-white">
            <h4 className="mb-4 text-sm font-bold text-yellow">Coming Up</h4>
            {COMING_UP.map((item) => (
              <Link
                key={item.href}
                href={item.href as `/${string}`}
                className="flex items-center justify-between border-b border-white/15 py-3 text-[13.5px] last:border-b-0"
              >
                <span>{item.title}</span>
                <span className="shrink-0 pl-3 text-xs font-bold text-yellow">{item.when}</span>
              </Link>
            ))}
            <div className="mt-4 rounded-2xl border-2 border-dashed border-white/35 p-4 text-center">
              <p className="mb-2.5 text-xs text-white/70">
                Got a take nobody&rsquo;s put on the floor yet?
              </p>
              <a href="#composer-anchor" className={btnWhiteSm}>
                + Start a Topic
              </a>
            </div>
          </div>
        </div>

        <div
          id="composer-anchor"
          className="mt-6 scroll-mt-24 rounded-[20px] border-2 border-ink bg-white p-6"
          style={{ boxShadow: "6px 6px 0 var(--purple)" }}
        >
          {submitted ? (
            <p className="font-semibold text-ink">
              ✓ Thanks, your topic is with the editors for review before it goes live.
            </p>
          ) : (
            <form onSubmit={submit}>
              <h4 className="mb-3.5 text-lg font-semibold text-ink">Start a topic</h4>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(false);
                }}
                placeholder={
                  error
                    ? "A topic needs a question or a take first…"
                    : "What's the question or take you want on the floor?"
                }
                className={`mb-3 w-full rounded-xl border-2 px-3.5 py-3 text-sm outline-none ${error ? "border-red" : "border-line"}`}
              />
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Add a little context, why does this matter right now?"
                className="mb-4 min-h-[80px] w-full resize-y rounded-xl border-2 border-line px-3.5 py-3 text-sm outline-none"
              />
              <div className="mb-4 flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => setSelectedTag(tag.label)}
                    className={`rounded-full border-2 px-3.5 py-1.5 text-[12.5px] font-semibold ${
                      selectedTag === tag.label
                        ? "border-purple bg-purple-tint text-purple-deep"
                        : "border-line bg-white text-ink"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setContext("");
                    setError(false);
                  }}
                  className={btnGhostSm}
                >
                  Cancel
                </button>
                <button type="submit" className={btnPurpleSm}>
                  Put It On The Floor
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
