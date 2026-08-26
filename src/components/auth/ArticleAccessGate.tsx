"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { buildContinuationQuery, getSafeReturnTo } from "@/lib/auth/returnTo";

type AccessLevel = "public" | "subscriber";

export interface ArticleAccessGateProps {
  /** "public" requires only sign-in; "subscriber" additionally requires isSubscriber. */
  level: AccessLevel;
  /** Forwarded as ?action= so login/pricing know what the user was trying to do. */
  action?: string;
  children: ReactNode;
  /** Rendered while auth status is loading, or while a redirect is in flight. */
  fallback?: ReactNode;
}

/**
 * Whole-page/whole-action gate for auth- and subscription-required screens
 * (e.g. /account/saved) — redirects to /login or /pricing rather than
 * rendering a locked preview in place.
 *
 * FIXED: this previously imported a nonexistent "@/lib/auth/auth" module
 * and read `isPremium`, which doesn't exist on AuthContextValue (the real
 * field is `isSubscriber`) — it could not have compiled, let alone run.
 * Also redirected to "/subscribe", a route that doesn't exist; there is no
 * dedicated checkout flow yet (see PaywallPanel's note on the subscription
 * backend gap), so this now points at /pricing, the real marketing page.
 *
 * NOTE: article premium-gating itself does NOT use this component. Per the
 * product spec the article body renders a preview + inline PaywallPanel
 * (see ArticlePaywall), not a full-page redirect — the backend's
 * GET /articles/:slug response is authoritative for that, not a client
 * isSubscriber check. This gate is for pages that have nothing to show an
 * unauthenticated/non-subscriber visitor at all.
 *
 * CAVEAT: this is client-side gating only (it redirects after mount). It
 * is not a security boundary — the backend must independently authorize
 * every request this page's data comes from.
 */
export function ArticleAccessGate({
  level,
  action = "read",
  children,
  fallback = null,
}: ArticleAccessGateProps) {
  const { status, isAuthenticated, isSubscriber } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath = getSafeReturnTo(
    `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
  );

  useEffect(() => {
    if (status === "loading") return;

    if (!isAuthenticated) {
      router.replace(`/login${buildContinuationQuery({ returnTo: currentPath, action })}`);
      return;
    }

    if (level === "subscriber" && !isSubscriber) {
      router.replace(`/pricing${buildContinuationQuery({ returnTo: currentPath, action })}`);
    }
  }, [status, isAuthenticated, isSubscriber, level, action, currentPath, router]);

  if (status === "loading") return <>{fallback}</>;
  if (!isAuthenticated) return <>{fallback}</>;
  if (level === "subscriber" && !isSubscriber) return <>{fallback}</>;

  return <>{children}</>;
}

export default ArticleAccessGate;
