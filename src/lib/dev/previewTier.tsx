"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { EditorRole } from "@/lib/cms/types";

/**
 * Dev-only "preview as" override — tier AND role. This never decides real
 * access (SSR gates and the API are the real authority); it only changes
 * what components DISPLAY in development, so reviewers can see different
 * button/UI states without a second backend account per role.
 *
 * roleOverride replaces the old useEditorRole() local useState — that
 * hook now has nothing left to own; the real role comes from
 * AuthProvider. Any "preview as a different role" UI reads/writes here.
 */
type TierOverride = "logged-out" | "free" | "premium" | null;

interface PreviewContextValue {
  tierOverride: TierOverride;
  setTierOverride: (value: TierOverride) => void;
  roleOverride: EditorRole | null;
  setRoleOverride: (value: EditorRole | null) => void;
  enabled: boolean;
}

const PreviewContext = createContext<PreviewContextValue>({
  tierOverride: null,
  setTierOverride: () => {},
  roleOverride: null,
  setRoleOverride: () => {},
  enabled: false,
});

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [tierOverride, setTierOverride] = useState<TierOverride>(null);
  const [roleOverride, setRoleOverride] = useState<EditorRole | null>(null);
  const enabled = process.env.NODE_ENV !== "production";
  return (
    <PreviewContext.Provider
      value={{
        tierOverride: enabled ? tierOverride : null,
        setTierOverride,
        roleOverride: enabled ? roleOverride : null,
        setRoleOverride,
        enabled,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  return useContext(PreviewContext);
}
