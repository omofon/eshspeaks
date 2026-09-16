"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Clock3, CornerDownRight, Minus, Plus } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, relativeTime } from "@/lib/utils";
import type { ApiComment } from "@/lib/api/types";
import { btnPurpleSm } from "@/components/seat/seatButtons";

type Sort = "newest" | "oldest";

const MAX_INDENT = 4;
const AVATAR_COLORS = [
  "var(--orange)",
  "var(--purple)",
  "var(--green)",
  "var(--red)",
  "var(--yellow-deep)",
];

function countAll(c: ApiComment): number {
  return 1 + (c.replies ?? []).reduce((n, r) => n + countAll(r), 0);
}

function initialsFor(c: ApiComment): string {
  const name = c.author?.displayName ?? c.author?.username ?? "You";
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function nameFor(c: ApiComment): string {
  return c.author?.displayName ?? (c.author?.username ? `@${c.author.username}` : "Reader");
}

function colorFor(c: ApiComment): string {
  const seed = c.id || nameFor(c);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!;
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white"
      style={{ background: color }}
    >
      {initials}
    </span>
  );
}

function CommentNode({
  comment,
  depth,
  freshIds,
  posting,
  onReply,
}: {
  comment: ApiComment;
  depth: number;
  freshIds: Set<string>;
  posting: boolean;
  onReply: (parentId: string, body: string) => Promise<ApiComment | null>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState("");

  const replyCount = countAll(comment) - 1;
  const indent = Math.min(depth, MAX_INDENT);

  async function postReply(e: FormEvent) {
    e.preventDefault();
    if (draft.trim().length < 2) {
      setLocalError("Write a little more.");
      return;
    }
    setLocalError("");
    const created = await onReply(comment.id, draft.trim());
    if (created) {
      setDraft("");
      setReplying(false);
    }
  }

  return (
    <div className={cn("relative", indent > 0 && "ml-[38px] sm:ml-[52px]")}>
      <div
        className={cn(
          "flex gap-3.5 border-b border-line py-5 last:border-b-0",
          freshIds.has(comment.id) && "animate-flash",
        )}
      >
        <Avatar initials={initialsFor(comment)} color={colorFor(comment)} />
        <div className="flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <span className="text-[13.5px] font-bold text-ink">{nameFor(comment)}</span>
            {comment.status === "pending" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-tint px-2 py-0.5 text-[10px] font-bold text-yellow-shade">
                <Clock3 className="size-2.5" />
                Pending
              </span>
            ) : null}
            <span className="text-xs font-medium text-ink-soft">
              {relativeTime(comment.createdAt)}
            </span>
            {collapsed && replyCount > 0 ? (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="text-xs font-semibold text-orange"
              >
                · {replyCount} {replyCount === 1 ? "reply" : "replies"} hidden
              </button>
            ) : null}
            {indent === 0 && !collapsed && replyCount > 0 ? (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse thread"
                className="ml-auto grid size-6 shrink-0 place-items-center rounded-full border-2 border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <Minus className="size-3" />
              </button>
            ) : null}
            {indent === 0 && collapsed ? (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                aria-label="Expand thread"
                className="ml-auto grid size-6 shrink-0 place-items-center rounded-full border-2 border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <Plus className="size-3" />
              </button>
            ) : null}
          </div>

          {!collapsed ? (
            <>
              <p className="mb-2 max-w-[68ch] whitespace-pre-line text-[14.5px] text-ink">
                {comment.body}
              </p>

              <div className="flex items-center gap-4 text-[12.5px] font-semibold text-ink-soft">
                <button
                  type="button"
                  onClick={() => setReplying((v) => !v)}
                  className="flex items-center gap-1.5 hover:text-ink"
                >
                  <CornerDownRight className="size-3.5" /> Reply
                </button>
              </div>

              {replying ? (
                <form onSubmit={postReply} className="mt-3 max-w-2xl">
                  <textarea
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Reply to ${nameFor(comment)}…`}
                    disabled={posting}
                    className="w-full resize-y rounded-xl border-2 border-line p-3 text-[14.5px] outline-none transition-colors focus:border-ink disabled:opacity-60"
                  />
                  {localError ? <p className="mt-1 text-xs text-error">{localError}</p> : null}
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="submit"
                      disabled={posting}
                      className="rounded-full bg-purple px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
                    >
                      {posting ? "Posting…" : "Post reply"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplying(false);
                        setDraft("");
                        setLocalError("");
                      }}
                      className="rounded-full border-2 border-ink px-4 py-2 text-[13px] font-semibold text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}

              {comment.replies && comment.replies.length > 0
                ? comment.replies.map((r) => (
                    <CommentNode
                      key={r.id}
                      comment={r}
                      depth={depth + 1}
                      freshIds={freshIds}
                      posting={posting}
                      onReply={onReply}
                    />
                  ))
                : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CommentThread({ articleId, count }: { articleId: string; count: number }) {
  const { isAuthenticated, user } = useAuth();
  const { comments, loading, error, posting, postError, submit } = useComments(articleId);
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());

  const total = comments.reduce((n, c) => n + countAll(c), 0) || count;

  const sorted = useMemo(() => {
    const list = [...comments];
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return list;
  }, [comments, sort]);

  function markFresh(id: string) {
    setFreshIds((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      setFreshIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1800);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (draft.trim().length < 10) {
      setValidationError("Comments need at least 10 characters.");
      return;
    }
    setValidationError("");
    const created = await submit(draft.trim());
    if (created) {
      setDraft("");
      markFresh(created.id);
    }
  }

  async function onReply(parentId: string, body: string) {
    const created = await submit(body, parentId);
    if (created) markFresh(created.id);
    return created;
  }

  return (
    <section id="comments" className="mt-9 scroll-mt-24">
      <h2 className="mb-4 text-lg font-bold text-ink">Comments ({total})</h2>

      {isAuthenticated ? (
        <form onSubmit={onSubmit} className="mb-5 flex gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-bold text-white">
            {(user?.displayName ?? user?.username ?? "Y")[0]?.toUpperCase()}
          </span>
          <div className="flex-1">
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Join the discussion..."
              aria-label="Post a comment"
              disabled={posting}
              className="w-full resize-y rounded-2xl border-2 border-line p-3.5 text-[14.5px] outline-none transition-colors focus:border-ink disabled:opacity-60"
            />
            {validationError ? <p className="mt-1 text-sm text-error">{validationError}</p> : null}
            {postError ? <p className="mt-1 text-sm text-error">{postError}</p> : null}
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <p className="text-xs text-ink-soft">
                Signed in as {user?.displayName ?? user?.username ?? user?.email}. Comments are
                reviewed before they appear.
              </p>
              <button
                type="submit"
                disabled={posting}
                className={cn(btnPurpleSm, "shrink-0 disabled:opacity-60")}
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-5 rounded-2xl border-2 border-line bg-paper-2 p-4 text-sm">
          <p className="text-ink-soft">
            Sign in to join the discussion.{" "}
            <Link href="/login" className="font-semibold text-orange hover:underline">
              Sign in
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mb-2 flex items-center gap-2 border-b-2 border-line pb-3">
        <span className="mr-1 text-xs font-semibold text-ink-soft">Sort by</span>
        {(["newest", "oldest"] as Sort[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            className={cn(
              "rounded-full border-2 px-3.5 py-1.5 text-xs font-bold capitalize transition-colors",
              sort === s ? "border-ink bg-ink text-white" : "border-line text-ink-soft",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-error">{error}</p>
      ) : sorted.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No comments yet. Be the first to weigh in.</p>
      ) : (
        <div>
          {sorted.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              depth={0}
              freshIds={freshIds}
              posting={posting}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </section>
  );
}
