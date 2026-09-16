"use client";

import { useState } from "react";
import Link from "next/link";
import {
  colorForIndex,
  countReplies,
  initialsFor,
  type SeatReply,
  type SeatTopic,
} from "@/lib/data/seatTopics";
import { btnGhostSm, btnPurpleSm } from "./seatButtons";

function ReplyRow({
  reply,
  avatarColor,
  onLike,
}: {
  reply: SeatReply;
  avatarColor: string;
  onLike: () => void;
}) {
  return (
    <div className="flex gap-3.5 border-b border-line py-5 last:border-b-0">
      <div
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
        style={{ background: avatarColor }}
      >
        {initialsFor(reply.name)}
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

const SHARE_LINKS = (url: string, title: string) => [
  {
    label: "WhatsApp",
    href: `https://wa.me/?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`,
    bg: "#25D366",
  },
  {
    label: "X",
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    bg: "#000",
  },
  {
    label: "Facebook",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    bg: "#1877F2",
  },
  {
    label: "LinkedIn",
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    bg: "#0A66C2",
  },
];

/** No /seat/topics/{id}/posts endpoint yet — replies, likes and follow are
 *  local-only, same as the-seat.html's own preview thread. */
export function ThreadView({ topic }: { topic: SeatTopic }) {
  const [following, setFollowing] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [replies, setReplies] = useState(topic.replies);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState("");

  const total = countReplies({ ...topic, replies });
  const url = typeof window !== "undefined" ? window.location.href : "";

  function likeKey(path: string) {
    return path;
  }

  function likeAt(path: string, base: number) {
    setLikes((prev) => ({ ...prev, [likeKey(path)]: (prev[likeKey(path)] ?? base) + 1 }));
  }

  function post() {
    if (!draft.trim()) return;
    setReplies((prev) => [
      { name: "You", time: "just now", text: draft.trim(), likes: 0 },
      ...prev,
    ]);
    setDraft("");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setShareOpen(false);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-4 text-[12.5px] font-semibold text-ink-soft">
        <Link href="/the-seat" className="hover:text-purple">
          The Seat
        </Link>{" "}
        /{" "}
        <Link href="/topics" className="hover:text-purple">
          Topics
        </Link>{" "}
        / {topic.category}
      </div>

      <div
        className="mb-2 rounded-[20px] border-2 border-ink bg-white p-6"
        style={{ boxShadow: "6px 6px 0 var(--purple)" }}
      >
        <span
          className="mb-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-bold"
          style={{ color: topic.color }}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: topic.color }} />
          {topic.tag}
        </span>
        <h1 className="mb-3.5 text-[26px] leading-[1.3] font-semibold text-ink">{topic.title}</h1>
        <div className="flex flex-wrap gap-5 border-t-2 border-dashed border-line pt-4 text-[12.5px] font-semibold text-ink-soft">
          <span>Started by {topic.startedBy}</span>
          <span>{total} replies</span>
          <span>{topic.followers.toLocaleString()} following</span>
          <span>{topic.category}</span>
          <span>Active {topic.lastActive}</span>
        </div>
        <div className="mt-4.5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setFollowing((v) => !v)}
            className={
              following
                ? "inline-flex items-center gap-1.5 rounded-full bg-purple px-4 py-2 text-[13px] font-semibold text-white"
                : btnGhostSm
            }
          >
            {following ? "✓ Following" : "+ Follow"}
          </button>
          <div className="relative">
            <button type="button" onClick={() => setShareOpen((v) => !v)} className={btnGhostSm}>
              ↗ Share Thread
            </button>
            {shareOpen ? (
              <div
                className="absolute left-0 top-[calc(100%+8px)] z-40 min-w-[190px] rounded-2xl border-2 border-ink bg-white p-2"
                style={{ boxShadow: "4px 4px 0 var(--ink)" }}
              >
                {SHARE_LINKS(url, topic.title).map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShareOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold hover:bg-paper-2"
                  >
                    <span
                      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md text-white"
                      style={{ background: link.bg }}
                    >
                      {link.label[0]}
                    </span>
                    {link.label}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold hover:bg-paper-2"
                >
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-ink text-white">
                    ⧉
                  </span>
                  {copied ? "Link copied" : "Copy Link"}
                </button>
              </div>
            ) : null}
          </div>
          <Link
            href={`/the-seat?topic=${encodeURIComponent(topic.title)}#composer-anchor`}
            className={btnGhostSm}
          >
            Raise a Related Topic
          </Link>
        </div>
      </div>

      <div className="my-7 text-base font-bold text-ink">{total} replies</div>

      <div className="flex gap-3 border-t-2 border-dashed border-line pb-2 pt-5">
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

      {replies.length === 0 ? (
        <div className="py-8 text-center text-[13.5px] text-ink-soft">
          No replies yet, be the first to weigh in.
        </div>
      ) : (
        <div>
          {replies.map((reply, i) => (
            <div key={`${reply.name}-${i}`}>
              <ReplyRow
                reply={{ ...reply, likes: likes[`${i}`] ?? reply.likes }}
                avatarColor={colorForIndex(i)}
                onLike={() => likeAt(`${i}`, reply.likes)}
              />
              {(reply.replies ?? []).map((nested, j) => (
                <div key={`${reply.name}-${i}-${j}`} className="ml-[52px]">
                  <ReplyRow
                    reply={{ ...nested, likes: likes[`${i}-${j}`] ?? nested.likes }}
                    avatarColor={colorForIndex(i + j + 1)}
                    onLike={() => likeAt(`${i}-${j}`, nested.likes)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
