"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/home/colouresh/SectionHeading";
import { btnGhostSm, btnPurpleSm } from "./seatButtons";

interface Reply {
  name: string;
  time: string;
  text: string;
  likes: number;
  color: string;
  nested?: boolean;
}

const INITIAL_REPLIES: Reply[] = [
  {
    name: "Tunde B.",
    time: "1h ago",
    text: "Fair, but enforcement is a state-level problem too. Federal policy can only do so much if states don't follow through.",
    likes: 31,
    color: "var(--green)",
    nested: true,
  },
  {
    name: "Kelechi O.",
    time: "48m ago",
    text: "Nobody's talking about how this affects the informal sector. That's most of the country, and the policy barely mentions them.",
    likes: 56,
    color: "var(--purple)",
  },
  {
    name: "Chioma N.",
    time: "20m ago",
    text: "Genuinely curious what the enforcement budget line looks like. Has anyone actually seen it published anywhere?",
    likes: 19,
    color: "var(--red)",
  },
];

function ReplyRow({ reply, onLike }: { reply: Reply; onLike: () => void }) {
  return (
    <div
      className={`flex gap-3.5 border-b border-line py-4.5 last:border-b-0 ${reply.nested ? "ml-[52px]" : ""}`}
    >
      <div
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
        style={{ background: reply.color }}
      >
        {reply.name[0]}
      </div>
      <div className="flex-1">
        <div className="mb-0.5 text-[13.5px] font-bold text-ink">
          {reply.name}{" "}
          <span className="ml-1.5 text-xs font-medium text-ink-soft">{reply.time}</span>
        </div>
        <div className="mb-2 text-[14.5px] text-ink">{reply.text}</div>
        <div className="flex gap-4 text-[12.5px] font-semibold text-ink-soft">
          <button type="button" onClick={onLike} className="flex items-center gap-1">
            ♥ {reply.likes}
          </button>
          <span>↩ Reply</span>
        </div>
      </div>
    </div>
  );
}

/**
 * No /seat/topics/{id}/posts endpoint exists yet, so this preview thread
 * is static content and replying only appends locally, matching the
 * prototype's own vanilla-JS behaviour exactly.
 */
export function SeatThread() {
  const [open, setOpen] = useState(true);
  const [replies, setReplies] = useState(INITIAL_REPLIES);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [draft, setDraft] = useState("");

  function likeAt(i: number) {
    setLikes((prev) => ({ ...prev, [i]: (prev[i] ?? replies[i]!.likes) + 1 }));
  }

  function post() {
    if (!draft.trim()) return;
    setReplies((prev) => [
      ...prev,
      { name: "You", time: "just now", text: draft.trim(), likes: 0, color: "var(--purple)" },
    ]);
    setDraft("");
  }

  return (
    <section id="thread" className="border-b-2 border-ink bg-[#F1EBFF] py-14 sm:py-20">
      <div className="container-colouresh">
        <SectionHeading
          dot="var(--purple)"
          chipLabel="Open right now"
          title="Inside a live thread"
          note="This is what a conversation looks like once people show up. Expand it, read it, reply if you've got something to add, then close it back."
        />

        <div
          className="overflow-hidden rounded-[20px] border-2 border-ink bg-white"
          style={{ boxShadow: "6px 6px 0 var(--purple)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-line p-6">
            <div>
              <h3 className="max-w-[600px] text-xl leading-[1.35] font-semibold text-ink">
                Is the new housing policy built for people who actually need it, or for the
                headlines?
              </h3>
              <div className="mt-2 text-[12.5px] font-semibold text-ink-soft">
                Started by Eshomomoh · {replies.length + 1} replies · Politics and Governance
              </div>
            </div>
            <button type="button" onClick={() => setOpen((v) => !v)} className={btnGhostSm}>
              {open ? "Close Thread" : "Open Thread"}
            </button>
          </div>

          {open ? (
            <div className="p-6 pt-2">
              <ReplyRow
                reply={{
                  name: "Adaeze P.",
                  time: "2h ago",
                  text: "The housing policy piece missed the enforcement gap entirely. Rules mean nothing without teeth. Who's actually tracking whether allocations reach the people they're meant for?",
                  likes: likes[-1] ?? 84,
                  color: "var(--orange)",
                }}
                onLike={() => likeAt(-1)}
              />
              {replies.map((reply, i) => (
                <ReplyRow
                  key={`${reply.name}-${i}`}
                  reply={{ ...reply, likes: likes[i] ?? reply.likes }}
                  onLike={() => likeAt(i)}
                />
              ))}

              <div className="mt-4.5 flex gap-3 border-t-2 border-dashed border-line pt-4.5">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">
                  Y
                </div>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") post();
                  }}
                  placeholder="Add your reply..."
                  className="flex-1 rounded-full border-2 border-line px-4.5 py-3 text-sm outline-none"
                />
                <button type="button" onClick={post} className={btnPurpleSm}>
                  Post
                </button>
              </div>

              <div className="mt-2.5 border-t-2 border-dashed border-line pt-2.5 text-center">
                <Link href="/thread/housing-policy" className={btnPurpleSm}>
                  View Full Thread & All Replies →
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
