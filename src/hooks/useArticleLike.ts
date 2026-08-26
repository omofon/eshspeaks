"use client";

import { useState } from "react";
import { toggleArticleLike } from "@/lib/api/articles";
import { ApiError } from "@/lib/api/client";

/**
 * POST /articles/:id/like toggles server-side (1 like/account/article,
 * backend-enforced) and returns the authoritative {liked, likesCount} in
 * one round trip — so this applies an optimistic flip for instant
 * feedback, then reconciles with whatever the server actually returns,
 * and rolls back cleanly on failure rather than trusting the optimistic
 * guess forever.
 */
export function useArticleLike(articleId: string, initialLiked: boolean, initialCount: number) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (pending) return;
    setError(null);
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));
    setPending(true);
    try {
      const result = await toggleArticleLike(articleId);
      setLiked(result.liked);
      setCount(result.likesCount);
    } catch (e) {
      setLiked(prevLiked);
      setCount(prevCount);
      setError(e instanceof ApiError ? e.message : "Couldn't update your like. Try again.");
    } finally {
      setPending(false);
    }
  }

  return { liked, count, pending, error, toggle };
}
