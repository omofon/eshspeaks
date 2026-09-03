"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchComments, postComment } from "@/lib/api/comments";
import { ApiError } from "@/lib/api/client";
import type { ApiComment } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthProvider";

/** Insert a freshly created comment into the tree: nested under its parent, or at the top. */
function insertComment(
  list: ApiComment[],
  created: ApiComment,
  parentCommentId?: string,
): ApiComment[] {
  if (!parentCommentId) return [created, ...list];
  return list.map((c) => {
    if (c.id === parentCommentId) {
      return { ...c, replies: [...(c.replies ?? []), created] };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: insertComment(c.replies, created, parentCommentId) };
    }
    return c;
  });
}

export function useComments(articleId: string) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchComments(articleId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Couldn't load comments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  useEffect(() => load(), [load]);

  /**
   * Post a comment or a reply. Returns the created comment (so the caller
   * can highlight it) or null on failure. The optimistic insert nests a
   * reply under its parent; `created.status` from the real response drives
   * the pending-moderation badge, never a guess.
   */
  const submit = useCallback(
    async (body: string, parentCommentId?: string): Promise<ApiComment | null> => {
      if (!isAuthenticated) return null;
      setPosting(true);
      setPostError(null);
      try {
        const created = await postComment(articleId, body, parentCommentId);
        setComments((prev) => insertComment(prev, created, parentCommentId));
        return created;
      } catch (e) {
        setPostError(e instanceof ApiError ? e.message : "Couldn't post your comment. Try again.");
        return null;
      } finally {
        setPosting(false);
      }
    },
    [articleId, isAuthenticated],
  );

  return { comments, loading, error, posting, postError, submit, reload: load };
}
