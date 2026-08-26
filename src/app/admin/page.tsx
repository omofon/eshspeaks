"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { FileText, PenSquare, Shield, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useEditorRole } from "@/hooks/useEditorRole";
import { fetchEditorialArticles } from "@/lib/api/articles";
import { fetchEditorialUsers } from "@/lib/api/roles";
import { ApiError } from "@/lib/api/client";
import type { ArticleStatus } from "@/lib/cms/types";
import { DashboardSkeleton } from "@/components/skeletons";

const STATUS_FILTERS: { status: ArticleStatus | undefined; label: string }[] = [
  { status: undefined, label: "Total stories" },
  { status: "draft", label: "Drafts" },
  { status: "in_review", label: "In review" },
  { status: "published", label: "Published" },
];

/**
 * Real counts only — every number here comes from a paginated list
 * endpoint's `meta.total` with `limit: 1` (cheap: tiny payload, exact
 * count), never a fabricated metric. A Contributor's counts are their own
 * work only (backend-enforced via the `mine` semantics on
 * /articles/editorial/mine); Section Lead/Chief Editor see the newsroom
 * scope the backend grants them.
 */
export default function AdminOverviewPage() {
  const { user } = useAuth();
  const role = useEditorRole();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [editorialUserCount, setEditorialUserCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;
    let cancelled = false;

    Promise.all(
      STATUS_FILTERS.map(({ status }) =>
        fetchEditorialArticles({ status, limit: 1 }).then(({ meta }) => meta.total),
      ),
    )
      .then((totals) => {
        if (cancelled) return;
        const next: Record<string, number> = {};
        STATUS_FILTERS.forEach((f, i) => {
          next[f.label] = totals[i]!;
        });
        setCounts(next);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Couldn't load counts.");
      });

    if (role === "chief_editor") {
      fetchEditorialUsers()
        .then((users) => {
          if (!cancelled) setEditorialUserCount(users.length);
        })
        .catch(() => {
          if (!cancelled) setEditorialUserCount(null);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [role]);

  if (!role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Checking your newsroom access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
      <header className="hairline sticky top-0 z-10" style={{ background: "var(--background)" }}>
        <div className="container-eshspeaks flex h-16 items-center justify-between">
          <h1 className="headline-sm" style={{ color: "var(--navy)" }}>
            Newsroom overview
          </h1>
          <Link
            href="/admin/articles/editor"
            className="btn-accent inline-flex items-center gap-1.5"
          >
            <PenSquare size={15} />
            New story
          </Link>
        </div>
      </header>

      <div className="container-eshspeaks pt-6">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Welcome back{user?.displayName ? `, ${user.displayName}` : ""}.
        </p>

        {error ? (
          <p
            className="mt-4 rounded-md border px-4 py-3 text-sm"
            style={{ borderColor: "var(--error)", color: "var(--error)" }}
          >
            {error}
          </p>
        ) : null}

        {!counts ? (
          <div className="mt-6">
            <DashboardSkeleton />
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STATUS_FILTERS.map((f) => (
                <div
                  key={f.label}
                  className="rounded-md border p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    {f.label}
                  </p>
                  <p className="mt-1 font-serif text-3xl" style={{ color: "var(--navy)" }}>
                    {counts[f.label]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <QuickLink
                href="/admin/articles"
                icon={FileText}
                title="Articles"
                body="Browse, filter and open any story in the editor."
              />
              {role === "section_lead" || role === "chief_editor" ? (
                <QuickLink
                  href="/admin/moderation"
                  icon={Shield}
                  title="Moderation"
                  body="Review comments waiting on a decision."
                />
              ) : null}
              {role === "chief_editor" ? (
                <QuickLink
                  href="/admin/roles"
                  icon={Users}
                  title="Editorial roles"
                  body={
                    editorialUserCount !== null
                      ? `${editorialUserCount} editorial account${editorialUserCount === 1 ? "" : "s"}.`
                      : "Assign roles and section coverage."
                  }
                />
              ) : null}
              {role === "chief_editor" ? (
                <QuickLink
                  href="/admin/sections"
                  icon={FileText}
                  title="Sections"
                  body="Manage sections and subsegments."
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: Route;
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border p-5 transition-colors hover:border-[var(--navy)]"
      style={{ borderColor: "var(--border)" }}
    >
      <Icon size={18} style={{ color: "var(--accent)" }} />
      <p className="mt-3 font-serif text-lg" style={{ color: "var(--navy)" }}>
        {title}
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
        {body}
      </p>
    </Link>
  );
}
