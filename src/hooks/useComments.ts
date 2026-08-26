"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchComments, postComment } from "@/lib/api/comments";
import { ApiError } from "@/lib/api/client";
import type { ApiComment } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthProvider";

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

  async function submit(body: string, parentCommentId?: string): Promise<boolean> {
    if (!isAuthenticated) return false;
    setPosting(true);
    setPostError(null);
    try {
      const created = await postComment(articleId, body, parentCommentId);
      // Optimistic insert — the backend may mark this pending moderation;
      // `created.status` (from the real response) drives that badge, not a guess.
      setComments((prev) => [created, ...prev]);
      return true;
    } catch (e) {
      setPostError(e instanceof ApiError ? e.message : "Couldn't post your comment. Try again.");
      return false;
    } finally {
      setPosting(false);
    }
  }

  return { comments, loading, error, posting, postError, submit, reload: load };
}
