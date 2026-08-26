"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiComment } from "@/lib/api/types";

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-navy font-mono text-[11px] text-background">
      {initials}
    </span>
  );
}

function initialsFor(comment: ApiComment): string {
  const name = comment.author?.displayName ?? comment.author?.username ?? "You";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function nameFor(comment: ApiComment): string {
  return (
    comment.author?.displayName ??
    (comment.author?.username ? `@${comment.author.username}` : "Reader")
  );
}

function timeFor(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CommentThread({ articleId, count }: { articleId: string; count: number }) {
  const { isAuthenticated, user } = useAuth();
  const { comments, loading, error, posting, postError, submit } = useComments(articleId);
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (draft.trim().length < 10) {
      setValidationError("Comments need at least 10 characters.");
      return;
    }
    setValidationError("");
    const ok = await submit(draft.trim());
    if (ok) setDraft("");
  }

  const total = comments.length || count;

  return (
    <section id="comments" className="mt-12">
      <h2 className="font-serif text-2xl text-navy">Comments{total ? ` (${total})` : ""}</h2>

      {isAuthenticated ? (
        <form onSubmit={onSubmit} className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Add to the discussion"
            aria-label="Post a comment"
            disabled={posting}
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-60"
          />
          {validationError ? <p className="mt-1 text-sm text-error">{validationError}</p> : null}
          {postError ? <p className="mt-1 text-sm text-error">{postError}</p> : null}
          <button
            type="submit"
            disabled={posting}
            className="mt-2 rounded-sm bg-navy px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {posting ? "Posting…" : "Post comment"}
          </button>
          <p className="mt-2 text-xs text-text-secondary">
            Signed in as {user?.displayName ?? user?.username ?? user?.email}. Comments are reviewed
            before they appear publicly.
          </p>
        </form>
      ) : (
        <div className="mt-4 rounded-sm border border-border bg-card p-4 text-sm">
          <p className="text-muted-foreground">
            Sign in to join the discussion.{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
            .
          </p>
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-sm" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-error">{error}</p>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-sm text-text-secondary">
          No comments yet — be the first to weigh in.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar initials={initialsFor(c)} />
              <div className="w-full">
                <p className="text-sm font-medium text-navy">
                  {nameFor(c)}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {timeFor(c.createdAt)}
                  </span>
                  {c.status === "pending" ? (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                      <Clock3 className="h-3 w-3" />
                      Pending review
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{c.body}</p>
                {c.replies && c.replies.length > 0 ? (
                  <ul className="mt-4 space-y-4 border-l border-border pl-4">
                    {c.replies.map((r) => (
                      <li key={r.id} className="flex gap-3">
                        <Avatar initials={initialsFor(r)} />
                        <div>
                          <p className="text-sm font-medium text-navy">
                            {nameFor(r)}{" "}
                            <span className="font-normal text-muted-foreground">
                              · {timeFor(r.createdAt)}
                            </span>
                          </p>
                          <p className="mt-1 text-sm leading-relaxed">{r.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
