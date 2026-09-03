"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Clock3, CornerDownRight, MessageSquare, Minus, Plus } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, relativeTime } from "@/lib/utils";
import type { ApiComment } from "@/lib/api/types";

type Sort = "newest" | "oldest";

const MAX_INDENT = 4;

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

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy-tint font-mono text-[10px] text-navy">
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
    <div className={cn("relative", indent > 0 && "pl-4 sm:pl-5")}>
      {indent > 0 ? (
        <button
          type="button"
          aria-label={collapsed ? "Expand thread" : "Collapse thread"}
          onClick={() => setCollapsed((v) => !v)}
          className="group absolute left-0 top-0 h-full w-4 cursor-pointer"
        >
          <span className="absolute left-[7px] top-0 h-full w-px bg-border transition-colors group-hover:bg-accent" />
        </button>
      ) : null}

      <div className={cn("rounded-sm py-3 pl-1", freshIds.has(comment.id) && "animate-flash")}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand" : "Collapse"}
            className="grid size-5 shrink-0 place-items-center rounded-sm border border-border text-text-muted transition-colors hover:border-navy hover:text-navy active:scale-90"
          >
            {collapsed ? <Plus className="size-3" /> : <Minus className="size-3" />}
          </button>
          <Avatar initials={initialsFor(comment)} />
          <span className="text-[13px] font-semibold text-text-primary">{nameFor(comment)}</span>
          {comment.status === "pending" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-warning">
              <Clock3 className="size-2.5" />
              Pending
            </span>
          ) : null}
          <span className="meta text-[10px] normal-case tracking-normal">
            · {relativeTime(comment.createdAt)}
          </span>
          {collapsed && replyCount > 0 ? (
            <span className="meta text-[10px] normal-case tracking-normal text-accent">
              · {replyCount} {replyCount === 1 ? "reply" : "replies"} hidden
            </span>
          ) : null}
        </div>

        {/* grid-rows 0fr -> 1fr gives a smooth height collapse with no fixed max-height */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="overflow-hidden">
            <p className="ml-7 mt-1.5 max-w-[68ch] whitespace-pre-line text-[15px] leading-7 text-text-primary">
              {comment.body}
            </p>

            <div className="ml-6 mt-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setReplying((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted transition-colors hover:bg-muted hover:text-navy active:scale-95"
              >
                <CornerDownRight className="size-3" /> Reply
              </button>
            </div>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                replying ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <form onSubmit={postReply} className="ml-7 mt-3 max-w-2xl">
                  <textarea
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Reply to ${nameFor(comment)}…`}
                    disabled={posting}
                    className="w-full resize-y rounded-sm border border-border bg-background-soft p-3 text-[15px] outline-none transition-colors focus:border-navy disabled:opacity-60"
                  />
                  {localError ? <p className="mt-1 text-xs text-error">{localError}</p> : null}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={posting}
                      className="rounded-full bg-navy px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-inverse transition-colors hover:bg-navy-soft disabled:opacity-60"
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
                      className="rounded-full border border-border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-navy"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {comment.replies && comment.replies.length > 0 ? (
              <div className="ml-3 mt-1">
                {comment.replies.map((r) => (
                  <CommentNode
                    key={r.id}
                    comment={r}
                    depth={depth + 1}
                    freshIds={freshIds}
                    posting={posting}
                    onReply={onReply}
                  />
                ))}
              </div>
            ) : null}
          </div>
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
    <section id="comments" className="mt-14 scroll-mt-24">
      <div className="flex items-center gap-3 border-t-2 border-navy pt-4">
        <MessageSquare className="size-4 text-navy" />
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-navy">
          {total} {total === 1 ? "comment" : "comments"}
        </h2>
      </div>

      {isAuthenticated ? (
        <form
          onSubmit={onSubmit}
          className="mt-5 rounded-sm border border-border bg-background-soft p-4"
        >
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What do you make of this reporting?"
            aria-label="Post a comment"
            disabled={posting}
            className="w-full resize-y rounded-sm border border-border bg-background p-3 text-[15px] outline-none transition-colors focus:border-navy disabled:opacity-60"
          />
          {validationError ? <p className="mt-1 text-sm text-error">{validationError}</p> : null}
          {postError ? <p className="mt-1 text-sm text-error">{postError}</p> : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="meta text-[10px] normal-case tracking-normal">
              Signed in as {user?.displayName ?? user?.username ?? user?.email}. Comments are
              reviewed before they appear.
            </p>
            <button
              type="submit"
              disabled={posting}
              className="shrink-0 rounded-full bg-accent px-5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {posting ? "Posting…" : "Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-sm border border-border bg-background-soft p-4 text-sm">
          <p className="text-text-secondary">
            Sign in to join the discussion.{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-1 border-b border-border pb-2">
        <span className="meta mr-2">Sort by</span>
        {(["newest", "oldest"] as Sort[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-150",
              sort === s ? "bg-navy text-text-inverse" : "text-text-secondary hover:bg-muted",
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
              <Skeleton className="size-6 shrink-0 rounded-full" />
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
        <p className="mt-6 text-sm text-text-secondary">
          No comments yet. Be the first to weigh in.
        </p>
      ) : (
        <div className="mt-2 divide-y divide-border">
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
