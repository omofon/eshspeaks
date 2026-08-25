"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { usePreview } from "@/lib/dev/previewTier";
import { isEditorRole, type EditorRole } from "@/lib/cms/types";

/**
 * Read-only view over the real session role, narrowed to editor-capable
 * roles, with a dev-only preview override layered on top (see
 * lib/dev/previewTier.tsx). Returns null for reader/premium (or while the
 * session is still loading) — callers should treat null as "not ready /
 * not permitted to render the editor", not as a role to pass around.
 */
export function useEditorRole(): EditorRole | null {
  const { role } = useAuth();
  const { roleOverride, enabled } = usePreview();
  if (enabled && roleOverride) return roleOverride;
  return isEditorRole(role) ? role : null;
}