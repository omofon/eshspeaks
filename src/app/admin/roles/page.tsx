"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useSectionsCatalog } from "@/hooks/useSectionsCatalog";
import { fetchEditorialUsers, assignRole, assignSections } from "@/lib/api/roles";
import { ApiError } from "@/lib/api/client";
import type { ApiEditorialUser } from "@/lib/api/types";
import type { UserRole } from "@/lib/auth/types";

const ASSIGNABLE_ROLES: UserRole[] = [
  "reader",
  "contributor",
  "state_correspondent",
  "section_lead",
  "chief_editor",
];
const ROLE_LABEL: Record<string, string> = {
  reader: "Reader",
  contributor: "Contributor",
  state_correspondent: "State correspondent",
  section_lead: "Section lead",
  chief_editor: "Chief editor",
};
/** Only these roles accept section assignments — global roles (Chief Editor) need none. */
const SECTION_SCOPED_ROLES = new Set(["contributor", "state_correspondent", "section_lead"]);

/**
 * There is no separate Admin role — Chief Editor carries this
 * responsibility, so this page is gated to chief_editor only.
 */
export default function RolesAdminPage() {
  const { status: authStatus, role: myRole, user } = useAuth();
  const { sections } = useSectionsCatalog();
  const permitted = myRole === "chief_editor";

  const [users, setUsers] = useState<ApiEditorialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchEditorialUsers()
      .then(setUsers)
      .catch((e: unknown) =>
        setError(e instanceof ApiError ? e.message : "Couldn't load editorial users."),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (permitted) load();
  }, [permitted]);

  async function onRoleChange(target: ApiEditorialUser, role: UserRole) {
    if (target.id === user?.id) return; // backend also rejects this — CANNOT_CHANGE_OWN_ROLE
    setSavingId(target.id);
    setError(null);
    try {
      const updated = await assignRole(target.id, role);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't change that role.");
    } finally {
      setSavingId(null);
    }
  }

  async function onSectionsChange(target: ApiEditorialUser, sectionIds: string[]) {
    setSavingId(target.id);
    setError(null);
    try {
      const updated = await assignSections(target.id, sectionIds);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't update section assignments.");
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
          Role management is limited to the Chief Editor.
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
        <div className="container-eshspeaks flex h-16 items-center">
          <h1 className="headline-sm" style={{ color: "var(--navy)" }}>
            Editorial roles
          </h1>
        </div>
      </header>

      <div className="container-eshspeaks pt-6">
        {error ? (
          <p
            className="mb-4 rounded-md border px-4 py-3 text-sm"
            style={{ borderColor: "var(--error)", color: "var(--error)" }}
          >
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No editorial accounts yet.</p>
        ) : (
          <ul className="space-y-4">
            {users.map((u) => (
              <li
                key={u.id}
                className="rounded-md border p-4"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                      {u.displayName ?? u.username ?? u.email}
                    </p>
                    <p className="meta mt-0.5">{u.email}</p>
                  </div>
                  <select
                    value={u.role}
                    disabled={savingId === u.id || u.id === user?.id}
                    onChange={(e) => onRoleChange(u, e.target.value as UserRole)}
                    className="rounded border bg-[var(--card)] px-2 py-1.5 text-sm disabled:opacity-50"
                    style={{ borderColor: "var(--border)" }}
                    title={u.id === user?.id ? "You can't change your own role" : undefined}
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </div>

                {SECTION_SCOPED_ROLES.has(u.role) ? (
                  <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                    <p className="kicker-muted mb-2">Sections covered</p>
                    <div className="flex flex-wrap gap-2">
                      {sections.map((s) => {
                        const active = u.sections.some((sec) => sec.id === s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={savingId === u.id}
                            onClick={() => {
                              const nextIds = active
                                ? u.sections.filter((sec) => sec.id !== s.id).map((sec) => sec.id)
                                : [...u.sections.map((sec) => sec.id), s.id];
                              onSectionsChange(u, nextIds);
                            }}
                            className="rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50"
                            style={
                              active
                                ? {
                                    background: "var(--navy)",
                                    color: "var(--text-inverse)",
                                    borderColor: "var(--navy)",
                                  }
                                : { borderColor: "var(--border)", color: "var(--text-secondary)" }
                            }
                          >
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
