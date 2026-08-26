"use client";

import { useEffect, useState } from "react";
import { fetchArticleBySlug } from "@/lib/api/articles";
import { ApiError } from "@/lib/api/client";
import type { ApiArticleDetail } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthProvider";

export type ArticleLoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; error: ApiError }
  | { status: "ready"; article: ApiArticleDetail };

/**
 * GET /api/v1/articles/:slug is server-gated per caller — a signed-in
 * subscriber's entitlement (or an editorial user's own unpublished draft)
 * only resolves correctly with their bearer token attached. The access
 * token lives in a browser-memory-only module variable (tokenStore), so
 * this fetch has to happen client-side, after auth has finished loading —
 * fetching it anonymously from the server would always show the locked
 * preview, even to paying subscribers.
 */
export function useArticle(slug: string) {
  const { status: authStatus } = useAuth();
  const [state, setState] = useState<ArticleLoadState>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (authStatus === "loading") return;
    let cancelled = false;
    setState({ status: "loading" });

    fetchArticleBySlug(slug)
      .then((article) => {
        if (!cancelled) setState({ status: "ready", article });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.kind === "not_found") {
          setState({ status: "not-found" });
        } else {
          setState({
            status: "error",
            error:
              e instanceof ApiError ? e : new ApiError("unknown", "Couldn't load this article."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, authStatus, reloadToken]);

  return { state, reload: () => setReloadToken((n) => n + 1) };
}
