"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth";
import { buildLoginHref, getSafeReturnTo } from "./returnTo";

/**
 * For actions that need auth but don't gate an entire view — comment, save,
 * follow, newsletter signup, etc. Call it with the action name; it gives
 * you back a function that either runs your callback immediately (already
 * authenticated) or sends the user to login with returnTo=current page and
 * action=<action>, and does NOT run the callback.
 *
 * Usage:
 *   const gatedComment = useAuthGatedAction("comment");
 *   <button onClick={() => gatedComment(() => setComposerOpen(true))}>Comment</button>
 *
 * IMPORTANT (spec 11/12): a redirect through login must never silently
 * perform the action on the user's behalf — e.g. never auto-submit a
 * comment just because the user landed back on the page with
 * ?action=comment in the URL. The page reading `action` back off the query
 * string on return should re-arm the affordance (open the comment box,
 * focus the input) — it should require one more explicit tap to actually
 * post/save/follow.
 *
 * NOT WIRED IN ANYWHERE — no comment/save/follow UI was in the file set
 * this was built from. This is the reusable primitive for when you build
 * those.
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
    const currentPath = getSafeReturnTo(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    router.push(buildLoginHref(currentPath, action));
  };
}

export default useAuthGatedAction;
