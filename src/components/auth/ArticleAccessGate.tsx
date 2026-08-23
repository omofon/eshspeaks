"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth";
import { buildContinuationQuery, getSafeReturnTo } from "@/lib/auth/returnTo";

type AccessLevel = "public" | "subscriber";

export interface ArticleAccessGateProps {
  /** "public" renders for everyone; "subscriber" additionally requires isPremium. */
  level: AccessLevel;
  /** Forwarded as ?action= so login/subscribe know what the user was trying to do. */
  action?: string;
  children: ReactNode;
  /** Rendered while auth status is loading, or while a redirect is in flight. */
  fallback?: ReactNode;
}

/**
 * Centralized gate for auth- and subscription-gated content, built on top
 * of the existing useAuth() from lib/auth/auth.tsx (status / isAuthenticated
 * / isPremium). Wrap the protected part of an article with this instead of
 * hand-rolling the same three checks on every page:
 *
 *   <ArticleAccessGate level="subscriber" action="read">
 *     <ArticleBody article={article} />
 *   </ArticleAccessGate>
 *
 * NOT WIRED IN ANYWHERE — no article route, /subscribe page, or checkout
 * flow was in the file set this was built from, so nothing calls this yet.
 * Drop it around your actual article body once you have it.
 *
 * CAVEAT: this is client-side gating only (it redirects after mount). If
 * the article body must never reach an unauthenticated browser at all —
 * e.g. it's inlined into the server-rendered HTML — this component alone
 * doesn't prevent that; the data fetch on the server needs its own check.
 */
export function ArticleAccessGate({ level, action = "read", children, fallback = null }: ArticleAccessGateProps) {
  const { status, isAuthenticated, isPremium } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath = getSafeReturnTo(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);

  useEffect(() => {
    if (status === "loading") return;

    if (!isAuthenticated) {
      router.replace(`/login${buildContinuationQuery({ returnTo: currentPath, action })}`);
      return;
    }

    if (level === "subscriber" && !isPremium) {
      router.replace(`/subscribe${buildContinuationQuery({ returnTo: currentPath, action })}`);
    }
  }, [status, isAuthenticated, isPremium, level, action, currentPath, router]);

  if (status === "loading") return <>{fallback}</>;
  if (!isAuthenticated) return <>{fallback}</>;
  if (level === "subscriber" && !isPremium) return <>{fallback}</>;

  return <>{children}</>;
}

export default ArticleAccessGate;
