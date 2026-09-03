"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  fetchAdminUsers,
  isAdminUsersUnavailable,
  type AdminUserRow,
  type SubscriptionStatus,
} from "@/lib/api/adminUsers";
import { assignRole, RolesApiError } from "@/lib/api/roles";
import { ApiError } from "@/lib/api/client";
import type { MembershipTier, UserRole } from "@/lib/auth/types";

/**
 * Chief-editor user directory: every account on the platform, not just
 * editorial staff. Search, filter by role / membership tier, promote or
 * demote, and see each reader's subscription plan and last-active state.
 *
 * The listing endpoint (`GET /admin/users`) is not live yet, so this
 * degrades to a "pending backend" panel on 404 — the same pattern the
 * notifications bell and the account billing sections use. Role changes go
 * through the live `POST /roles/assign`.
 */

const ROLE_FILTERS: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "reader", label: "Readers" },
  { value: "contributor", label: "Contributors" },
  { value: "state_correspondent", label: "Correspondents" },
  { value: "section_lead", label: "Section leads" },
  { value: "chief_editor", label: "Chief editors" },
];

const ASSIGNABLE_ROLES: UserRole[] = [
  "reader",
  "contributor",
  "state_correspondent",
  "section_lead",
  "chief_editor",
];

const ROLE_LABEL: Record<string, string> = {
  reader: "Reader",
  premium: "Premium reader",
  contributor: "Contributor",
  state_correspondent: "State correspondent",
  section_lead: "Section lead",
  chief_editor: "Chief editor",
};

const TIER_FILTERS: { value: MembershipTier | "all"; label: string }[] = [
  { value: "all", label: "All tiers" },
  { value: "FREE", label: "Free" },
  { value: "PREMIUM", label: "Premium" },
];

const SUBSCRIPTION_STYLE: Record<SubscriptionStatus, { bg: string; fg: string }> = {
  active: { bg: "var(--success-soft)", fg: "var(--success)" },
  past_due: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  canceled: { bg: "var(--muted)", fg: "var(--text-muted)" },
  none: { bg: "var(--muted)", fg: "var(--text-muted)" },
};

const ACTIVE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

function isActive(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  const t = new Date(lastActiveAt).getTime();
  return !Number.isNaN(t) && Date.now() - t < ACTIVE_WINDOW_MS;
}

function planLabel(row: AdminUserRow): string {
  if (row.subscription?.plan) return row.subscription.plan;
  return row.membershipTier === "PREMIUM" ? "Premium" : "Free";
}

export default function AdminUsersPage() {
  const { status: authStatus, role: myRole, user } = useAuth();
  const permitted = myRole === "chief_editor";

  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [tierFilter, setTierFilter] = useState<MembershipTier | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [meta, setMeta] = useState<{ totalPages: number; total: number } | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "unavailable" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!permitted) return;
    let cancelled = false;
    setPhase("loading");
    setError(null);
    fetchAdminUsers({
      role: roleFilter === "all" ? undefined : roleFilter,
      tier: tierFilter === "all" ? undefined : tierFilter,
      search: search || undefined,
      page,
      limit: 25,
    })
      .then(({ items, meta: m }) => {
        if (cancelled) return;
        setRows(items);
        setMeta({ totalPages: m.totalPages, total: m.total });
        setPhase("ready");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (isAdminUsersUnavailable(e)) {
          setPhase("unavailable");
        } else {
          setError(e instanceof ApiError ? e.message : "Couldn't load the user directory.");
          setPhase("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [permitted, roleFilter, tierFilter, search, page]);

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function onRoleChange(target: AdminUserRow, nextRole: UserRole) {
    if (target.id === user?.id) return; // backend also rejects CANNOT_CHANGE_OWN_ROLE
    setSavingId(target.id);
    setError(null);
    try {
      await assignRole(target.id, nextRole);
      setRows((prev) => prev.map((r) => (r.id === target.id ? { ...r, role: nextRole } : r)));
    } catch (e) {
      setError(e instanceof RolesApiError ? e.message : "Couldn't change that role.");
    } finally {
      setSavingId(null);
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
          The user directory is limited to the Chief Editor.
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
            People
          </h1>
          {meta ? (
            <p className="meta">
              {meta.total} {meta.total === 1 ? "account" : "accounts"}
            </p>
          ) : null}
        </div>
      </header>

      <div className="container-eshspeaks pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={onSearchSubmit} className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email"
              className="w-64 rounded-md border bg-[var(--card)] py-1.5 pl-8 pr-3 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
          </form>

          <div
            className="flex overflow-hidden rounded-md border"
            style={{ borderColor: "var(--border)" }}
          >
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setRoleFilter(f.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={
                  roleFilter === f.value
                    ? { background: "var(--navy)", color: "var(--text-inverse)" }
                    : { background: "var(--card)", color: "var(--text-secondary)" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          <div
            className="flex overflow-hidden rounded-md border"
            style={{ borderColor: "var(--border)" }}
          >
            {TIER_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setTierFilter(f.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={
                  tierFilter === f.value
                    ? { background: "var(--navy)", color: "var(--text-inverse)" }
                    : { background: "var(--card)", color: "var(--text-secondary)" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p
            className="mt-4 rounded-md border px-4 py-3 text-sm"
            style={{ borderColor: "var(--error)", color: "var(--error)" }}
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          {phase === "loading" ? (
            <p className="text-sm text-[var(--text-muted)]">Loading the directory…</p>
          ) : phase === "unavailable" ? (
            <div
              className="rounded-md border border-dashed py-14 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm text-[var(--text-secondary)]">
                The full user directory needs a backend endpoint that isn&rsquo;t live yet (
                <span className="font-mono text-xs">GET /admin/users</span>).
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Editorial accounts can still be managed from{" "}
                <Link href="/admin/roles" className="text-[var(--accent)] hover:underline">
                  Editorial roles
                </Link>
                .
              </p>
            </div>
          ) : phase === "error" ? (
            <p className="text-sm text-[var(--error)]">{error ?? "Something went wrong."}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No accounts match these filters.</p>
          ) : (
            <div
              className="overflow-hidden rounded-md border"
              style={{ borderColor: "var(--border)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left"
                    style={{ background: "var(--background-soft)", color: "var(--text-secondary)" }}
                  >
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide">
                      Person
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide">
                      Role
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide">
                      Plan
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide">
                      Joined
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide">
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const subStatus: SubscriptionStatus = row.subscription?.status ?? "none";
                    return (
                      <tr
                        key={row.id}
                        className="border-t"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium" style={{ color: "var(--navy)" }}>
                            {row.displayName ?? row.username ?? row.email.split("@")[0]}
                          </p>
                          <p className="meta">{row.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={ASSIGNABLE_ROLES.includes(row.role) ? row.role : "reader"}
                            disabled={savingId === row.id || row.id === user?.id}
                            onChange={(e) => onRoleChange(row, e.target.value as UserRole)}
                            className="rounded border bg-[var(--card)] px-2 py-1.5 text-xs disabled:opacity-50"
                            style={{ borderColor: "var(--border)" }}
                            title={
                              row.id === user?.id ? "You can't change your own role" : undefined
                            }
                          >
                            {ASSIGNABLE_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ color: "var(--text-primary)" }}>{planLabel(row)}</span>
                          {subStatus !== "none" ? (
                            <span
                              className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                              style={{
                                background: SUBSCRIPTION_STYLE[subStatus].bg,
                                color: SUBSCRIPTION_STYLE[subStatus].fg,
                              }}
                            >
                              {subStatus.replace("_", " ")}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {isActive(row.lastActiveAt) ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-xs"
                              style={{ color: "var(--success)" }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: "var(--success)" }}
                              />
                              Active
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {meta && meta.totalPages > 1 ? (
          <nav
            className="mt-8 flex items-center justify-between border-t pt-4 text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--accent)" }}
            >
              Newer
            </button>
            <span style={{ color: "var(--text-secondary)" }}>
              Page {page} of {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--accent)" }}
            >
              Older
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
