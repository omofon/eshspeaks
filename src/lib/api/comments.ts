import { apiRequest, apiRequestPaginated, toQueryString, type Paginated } from "@/lib/api/client";
import type { ApiComment, ApiModerationComment, CommentStatus } from "@/lib/api/types";

export { ApiError as CommentsApiError } from "@/lib/api/client";

/** GET /api/v1/articles/{id}/comments — comments visible to the caller (approved, plus their own pending). */
export async function fetchComments(articleId: string): Promise<ApiComment[]> {
  const data = await apiRequest<unknown>(`/articles/${encodeURIComponent(articleId)}/comments`, {
    method: "GET",
    auth: true,
  });
  return Array.isArray(data) ? (data as ApiComment[]) : [];
}

/** POST /api/v1/articles/{id}/comments — requires auth. */
export function postComment(
  articleId: string,
  body: string,
  parentCommentId?: string,
): Promise<ApiComment> {
  return apiRequest<ApiComment>(`/articles/${encodeURIComponent(articleId)}/comments`, {
    method: "POST",
    auth: true,
    body: { body, parentCommentId },
  });
}

/** `type`, not `interface` — see the note on ListParams in lib/api/articles.ts. */
export type ModerationQueueParams = {
  status?: CommentStatus | undefined;
  articleId?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: ("asc" | "desc") | undefined;
};

/** GET /api/v1/articles/comments/moderation — defaults to PENDING, oldest-first. */
export function fetchModerationQueue(
  params: ModerationQueueParams = {},
): Promise<Paginated<ApiModerationComment>> {
  return apiRequestPaginated<ApiModerationComment>(
    `/articles/comments/moderation${toQueryString(params)}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

/** PATCH /api/v1/articles/comments/{id}/status — approve or reject; PENDING is not an accepted target. */
export function moderateComment(
  commentId: string,
  status: "approved" | "rejected",
): Promise<ApiComment> {
  return apiRequest<ApiComment>(`/articles/comments/${encodeURIComponent(commentId)}/status`, {
    method: "PATCH",
    auth: true,
    body: { status },
  });
}
