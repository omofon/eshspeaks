"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { buildLoginHref, getSafeReturnTo } from "./returnTo";

/**
 * For actions that need auth but don't gate an entire view — comment, save,
 * follow, newsletter signup, etc.
 */
export function useAuthGatedAction(action: string) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return function runOrRedirectToLogin(run: () => void) {
    if (isAuthenticated) {
      run();
      return;
    }
    const currentPath = getSafeReturnTo(
      `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    );
    router.push(buildLoginHref(currentPath, action) as Route);
  };
}

/** Same pattern, gated on PREMIUM membership rather than just being signed in. */
export function useSubscriberGatedAction() {
  const { isAuthenticated, isSubscriber } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return function runOrRedirect(run: () => void) {
    if (isAuthenticated && isSubscriber) {
      run();
      return;
    }
    const safePath = getSafeReturnTo(pathname);
    router.push(isAuthenticated ? "/pricing" : (buildLoginHref(safePath, "subscribe") as Route));
  };
}

export default useAuthGatedAction;
