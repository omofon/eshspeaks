import { apiRequest, ApiError } from "@/lib/api/client";

export { ApiError as ArticleReviewApiError } from "@/lib/api/client";

/**
 * Editor → writer review notes.
 *
 * The backend endpoints described in CMS-BACKEND-REQUESTS.md (P1.3) do not
 * exist yet. `submitReviewNote` is called by the review UI right before it
 * flips an article's status; until the endpoint ships it 404s and the UI
 * treats that as "feedback couldn't be delivered" (via
 * `isReviewNotesUnavailable`) while still allowing the status change to go
 * through.
 */

export type ReviewDecision = "changes_requested" | "approved" | "rejected";

export interface ReviewNote {
  id: string;
  articleId: string;
  author: { id: string; displayName: string | null; role: string };
  body: string;
  decision: ReviewDecision | null;
  createdAt: string;
}

/** True when the failure is "the endpoint isn't live yet", not a real error. */
export function isReviewNotesUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.kind === "not_found" || error.status === 404);
}

export function submitReviewNote(
  articleId: string,
  input: { body: string; decision?: ReviewDecision },
): Promise<ReviewNote> {
  return apiRequest<ReviewNote>(`/articles/${encodeURIComponent(articleId)}/review-notes`, {
    method: "POST",
    auth: true,
    body: { body: input.body.trim(), ...(input.decision ? { decision: input.decision } : {}) },
  });
}

export function fetchReviewNotes(articleId: string): Promise<ReviewNote[]> {
  return apiRequest<ReviewNote[]>(`/articles/${encodeURIComponent(articleId)}/review-notes`, {
    method: "GET",
    auth: true,
  });
}
