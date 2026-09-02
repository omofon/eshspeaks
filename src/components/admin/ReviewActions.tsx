"use client";

import { useState } from "react";
import { changeArticleStatus, ArticleApiError } from "@/lib/api/articles";
import { submitReviewNote, isReviewNotesUnavailable } from "@/lib/api/articleReview";

/**
 * Approve / return-to-draft actions for a story sitting in `in_review`.
 * Shown on the CMS list to Section Leads and the Chief Editor.
 *
 * The status change (`PATCH /articles/{id}/status`) is live. The feedback
 * note (`POST /articles/{id}/review-notes`, see CMS-BACKEND-REQUESTS.md
 * P1.3) is not — when it 404s we still return the story to draft and tell
 * the reviewer the note couldn't be delivered yet.
 */
export function ReviewActions({
  articleId,
  onChanged,
}: {
  articleId: string;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<"idle" | "returning">("idle");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<null | "approve" | "return">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function approve() {
    setBusy("approve");
    setError(null);
    try {
      await changeArticleStatus(articleId, "published");
      onChanged();
    } catch (e) {
      setError(e instanceof ArticleApiError ? e.message : "Couldn't publish this story.");
    } finally {
      setBusy(null);
    }
  }

  async function returnToDraft() {
    if (!note.trim()) {
      setError("Add a short note so the writer knows what to change.");
      return;
    }
    setBusy("return");
    setError(null);
    let noteDelivered = true;
    try {
      await submitReviewNote(articleId, { body: note, decision: "changes_requested" });
    } catch (e) {
      if (isReviewNotesUnavailable(e)) noteDelivered = false;
      else {
        setError(e instanceof Error ? e.message : "Couldn't send your feedback.");
        setBusy(null);
        return;
      }
    }
    try {
      await changeArticleStatus(articleId, "draft");
      if (!noteDelivered) {
        setNotice(
          "Story returned to draft. Feedback delivery isn't live yet — tell the writer directly for now.",
        );
        setMode("idle");
        setNote("");
        onChanged();
      } else {
        onChanged();
      }
    } catch (e) {
      setError(e instanceof ArticleApiError ? e.message : "Couldn't return this story to draft.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-2">
      {mode === "idle" ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={approve}
            disabled={busy !== null}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--success)" }}
          >
            {busy === "approve" ? "Publishing…" : "Approve & publish"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("returning");
              setError(null);
            }}
            disabled={busy !== null}
            className="rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Return to draft
          </button>
        </div>
      ) : (
        <div
          className="rounded-md border p-2.5"
          style={{ borderColor: "var(--border)", background: "var(--background-soft)" }}
        >
          <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Feedback for the writer
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What needs to change before this can publish?"
            className="mt-1 w-full resize-y rounded-md border p-2 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={returnToDraft}
              disabled={busy !== null}
              className="rounded-md px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--navy)" }}
            >
              {busy === "return" ? "Sending…" : "Send & return to draft"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setNote("");
                setError(null);
              }}
              disabled={busy !== null}
              className="text-xs text-[var(--text-secondary)] hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error ? <p className="mt-1.5 text-[12px] text-[var(--error)]">{error}</p> : null}
      {notice ? <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">{notice}</p> : null}
    </div>
  );
}

export default ReviewActions;
