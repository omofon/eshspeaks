"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchModerationQueue, moderateComment } from "@/lib/api/comments";
import { ApiError } from "@/lib/api/client";
import type { ApiModerationComment, CommentStatus } from "@/lib/api/types";

const TABS: { value: CommentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

/**
 * Visible to Section Lead+ in this UI (rank-based) — the backend is the
 * real authority and will 403 an unauthorized call regardless of what
 * this page shows.
 */
export default function ModerationPage() {
  const { status: authStatus, hasRole } = useAuth();
  const permitted = hasRole(["section_lead"]);
  const [tab, setTab] = useState<CommentStatus>("pending");
  const [items, setItems] = useState<ApiModerationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchModerationQueue({ status: tab, limit: 50 })
      .then(({ items: fetched }) => setItems(fetched))
      .catch((e: unknown) =>
        setError(e instanceof ApiError ? e.message : "Couldn't load the moderation queue."),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!permitted) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, permitted]);

  async function act(id: string, status: "approved" | "rejected") {
    setActingId(id);
    try {
      await moderateComment(id, status);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't update that comment.");
    } finally {
      setActingId(null);
    }
  }

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Checking your newsroom access…</p>
      </div>
    );
  }

  if (!permitted) {
    return (
      <div className="container-eshspeaks py-16 text-center">
        <h1 className="headline-sm" style={{ color: "var(--navy)" }}>
          Not available
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Comment moderation is limited to Section Leads and the Chief Editor.
        </p>
        <Link
          href="/admin/articles"
          className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
        >
          Back to the CMS
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
      <header className="hairline sticky top-0 z-10" style={{ background: "var(--background)" }}>
        <div className="container-eshspeaks flex h-16 items-center justify-between">
          <h1 className="headline-sm" style={{ color: "var(--navy)" }}>
            Comment moderation
          </h1>
        </div>
      </header>

      <div className="container-eshspeaks pt-6">
        <div
          className="flex overflow-hidden rounded-md border"
          style={{ borderColor: "var(--border)", width: "fit-content" }}
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className="px-4 py-1.5 text-xs font-medium transition-colors"
              style={
                tab === t.value
                  ? { background: "var(--navy)", color: "var(--text-inverse)" }
                  : { background: "var(--card)", color: "var(--text-secondary)" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading…</p>
          ) : error ? (
            <p
              className="rounded-md border px-4 py-3 text-sm"
              style={{ borderColor: "var(--error)", color: "var(--error)" }}
            >
              {error}
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">Nothing here.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((c) => (
                <li
                  key={c.id}
                  className="rounded-md border p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p className="meta">
                    {c.author?.displayName ?? c.author?.username ?? "Reader"}
                    {c.article ? ` · on "${c.article.headline}"` : ""}
                    {" · "}
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-primary)" }}>
                    {c.body}
                  </p>
                  {tab === "pending" ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={actingId === c.id}
                        onClick={() => act(c.id, "approved")}
                        className="inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                        style={{ borderColor: "var(--success)", color: "var(--success)" }}
                      >
                        <Check size={13} />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={actingId === c.id}
                        onClick={() => act(c.id, "rejected")}
                        className="inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                        style={{ borderColor: "var(--error)", color: "var(--error)" }}
                      >
                        <X size={13} />
                        Reject
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
