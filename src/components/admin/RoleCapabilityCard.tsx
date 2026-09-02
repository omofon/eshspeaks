"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { canPublishDirectly, isEditorRole, type EditorRole } from "@/lib/cms/types";

/**
 * Small "what can I do here" card for the admin overview. Reads the real
 * authenticated role from AuthProvider (never the dev preview override) and
 * lists that role's capabilities in plain language.
 */
const ROLE_META: Record<EditorRole, { label: string; summary: string; can: string[] }> = {
  contributor: {
    label: "Contributor",
    summary: "You write and submit stories in the subsegments assigned to you.",
    can: [
      "Draft and edit your own stories",
      "Upload images and set story metadata",
      "Submit a story for a section lead to review",
    ],
  },
  state_correspondent: {
    label: "State correspondent",
    summary: "You file regional reporting into your assigned sections.",
    can: [
      "Draft and edit your own stories",
      "Cover the sections assigned to you",
      "Submit a story for review",
    ],
  },
  section_lead: {
    label: "Section lead",
    summary: "You own the editorial queue for your sections.",
    can: [
      "Everything a contributor can do",
      "Review, edit and publish stories in your sections",
      "Return a story to draft with feedback for the writer",
      "Moderate reader comments",
    ],
  },
  chief_editor: {
    label: "Chief editor",
    summary: "You have full editorial control and newsroom administration.",
    can: [
      "Publish or archive any story",
      "Moderate comments across every section",
      "Assign editorial roles and section coverage",
      "Manage sections and subsegments",
      "Delete stories",
    ],
  },
};

export function RoleCapabilityCard() {
  const { role } = useAuth();
  if (!isEditorRole(role)) return null;
  const meta = ROLE_META[role];

  return (
    <section
      className="rounded-md border p-5"
      style={{ borderColor: "var(--border)", background: "var(--background-soft)" }}
      aria-label="Your newsroom role"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        Your role
      </p>
      <p className="mt-1 font-serif text-xl" style={{ color: "var(--navy)" }}>
        {meta.label}
      </p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{meta.summary}</p>

      <ul className="mt-3 space-y-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
        {meta.can.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {!canPublishDirectly(role) ? (
        <p className="mt-3 text-[12px] text-[var(--text-muted)]">
          Your stories go to a section lead for review before they publish.
        </p>
      ) : null}
    </section>
  );
}

export default RoleCapabilityCard;
