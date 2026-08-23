"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import type { EditorRole } from "@/lib/cms/types";

/**
 * TODO(sprint-2-backend): `CurrentUser` doesn't carry a newsroom role yet.
 * Until `/auth/me` returns one (CMS-ARTICLES-CONTRACT.md §0), fall back to
 * the lowest-privilege role and expose the dev-only switcher so reviewers
 * can see both button states without a backend change.
 */
export function useEditorRole(): [EditorRole, (role: EditorRole) => void] {
  const { user } = useAuth();
  const backendRole = (user as unknown as { role?: EditorRole } | null)?.role;
  const [role, setRole] = useState<EditorRole>(backendRole ?? "contributor");
  return [role, setRole];
}
