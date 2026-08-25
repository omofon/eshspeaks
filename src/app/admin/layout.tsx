"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { buildLoginHref } from "@/lib/auth/returnTo";
import { isEditorRole } from "@/lib/cms/types";

/**
 * UX-level gate for everything under /admin — NOT the security boundary.
 *
 * The backend's session cookies (esh_at / esh_rt) are scoped to the
 * backend's own domain; frontend and backend are different origins, so
 * those cookies never reach a Next.js server request and there is no
 * server-side way to know who's signed in before this renders (see the
 * removal of getServerSession.ts / middleware.ts — both assumed a
 * same-origin cookie that doesn't exist here). AuthProvider's bearer-token
 * session is the only session this app actually has, and it only exists
 * client-side.
 *
 * So this component exists purely to avoid flashing admin UI at a signed
 * -out visitor and to send them to /login. It enforces nothing a modified
 * client or a direct API call couldn't bypass. Every write this UI
 * triggers (POST /api/v1/articles, etc.) MUST be independently
 * authorized by the backend's own RolesGuard — that's the real boundary.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const permitted = isAuthenticated && isEditorRole(role);

  useEffect(() => {
    if (status === "loading") return;
    // typedRoutes flags this as non-literal (same pre-existing friction as
    // useAuthGatedAction.ts's router.push(buildLoginHref(...)) elsewhere in
    // this repo) — not fixed here, see the audit report's remaining-issues list.
    if (!permitted) router.replace(buildLoginHref(pathname));
  }, [status, permitted, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  if (!permitted) return null;

  return <>{children}</>;
}
