"use client";

import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import {
  fetchReviewNotes,
  isReviewNotesUnavailable,
  type ReviewDecision,
  type ReviewNote,
} from "@/lib/api/articleReview";

/**
 * "What did the editor say" panel for a writer, and a read-only record for a
 * reviewer. Reads `GET /articles/{id}/review-notes` (CMS-BACKEND-REQUESTS.md
 * P1.3). That endpoint is not live yet, so a 404 degrades to a "pending
 * backend" line rather than an error — same pattern as NotificationBell and
 * the account-page billing shells. Status itself (published / in review /
 * returned to draft) is already visible on the article; this adds the
 * reviewer's written reason.
 */

const DECISION_LABEL: Record<ReviewDecision, string> = {
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected",
};

const DECISION_STYLE: Record<ReviewDecision, { bg: string; fg: string }> = {
  changes_requested: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  approved: { bg: "var(--success-soft)", fg: "var(--success)" },
  rejected: { bg: "var(--error-soft)", fg: "var(--error)" },
};

type State =
  | { kind: "loading" }
  | { kind: "ready"; notes: ReviewNote[] }
  | { kind: "unavailable" }
  | { kind: "error"; message: string };

export function ReviewNotesPanel({ articleId }: { articleId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    fetchReviewNotes(articleId)
      .then((notes) => {
        if (!cancelled) setState({ kind: "ready", notes });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (isReviewNotesUnavailable(e)) setState({ kind: "unavailable" });
        else
          setState({
            kind: "error",
            message: e instanceof Error ? e.message : "Couldn't load editor feedback.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  return (
    <section
      className="rounded-md border p-4"
      style={{ borderColor: "var(--border)", background: "var(--background-soft)" }}
      aria-label="Editor feedback"
    >
      <h2
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: "var(--navy)" }}
      >
        <MessageSquareText size={15} style={{ color: "var(--accent)" }} />
        Editor feedback
      </h2>

      {state.kind === "loading" ? (
        <p className="mt-2 text-sm text-[var(--text-muted)]">Loading feedback…</p>
      ) : state.kind === "unavailable" ? (
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Written editor feedback will appear here once the backend is connected. The story&rsquo;s
          status still tells you whether it was published or returned.
        </p>
      ) : state.kind === "error" ? (
        <p className="mt-2 text-sm text-[var(--error)]">{state.message}</p>
      ) : state.notes.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">No feedback from an editor yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {state.notes.map((note) => (
            <li
              key={note.id}
              className="rounded-md border p-3"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                  {note.author.displayName ?? "Editor"}
                </span>
                {note.decision ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      background: DECISION_STYLE[note.decision].bg,
                      color: DECISION_STYLE[note.decision].fg,
                    }}
                  >
                    {DECISION_LABEL[note.decision]}
                  </span>
                ) : null}
                <span className="meta ml-auto">
                  {new Date(note.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{note.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ReviewNotesPanel;
