"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
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
  const { status, isAuthenticated, role, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const permitted = isAuthenticated && isEditorRole(role);

  useEffect(() => {
    if (status === "loading") return;
    // buildLoginHref composes a dynamic query string typedRoutes can't
    // verify statically; the cast is safe because /login is a real route
    // and buildLoginHref only ever appends validated query params.
    if (!permitted) router.replace(buildLoginHref(pathname) as Route);
  }, [status, permitted, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  if (!permitted) return null;

  return (
    <>
      <nav
        aria-label="Newsroom admin sections"
        className="hairline flex items-center gap-5 px-4 py-2 text-xs font-medium"
        style={{ background: "var(--background-soft)", color: "var(--text-secondary)" }}
      >
        <Link href="/admin" className="hover:text-[var(--navy)]">
          Overview
        </Link>
        <Link href="/admin/articles" className="hover:text-[var(--navy)]">
          Articles
        </Link>
        {hasRole(["section_lead"]) ? (
          <Link href="/admin/moderation" className="hover:text-[var(--navy)]">
            Moderation
          </Link>
        ) : null}
        {role === "chief_editor" ? (
          <Link href="/admin/roles" className="hover:text-[var(--navy)]">
            Roles
          </Link>
        ) : null}
        {role === "chief_editor" ? (
          <Link href="/admin/sections" className="hover:text-[var(--navy)]">
            Sections
          </Link>
        ) : null}
      </nav>
      {children}
    </>
  );
}
