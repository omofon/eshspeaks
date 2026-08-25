"use client";

import { usePreview } from "@/lib/dev/previewTier";

const options = [
  { value: "logged-out", label: "Logged out" },
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
] as const;

export function DevTierToggle({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { override, setOverride, enabled } = usePreview();
  if (!enabled) return null; // inert outside development — no risk of shipping this control

  const dark = variant === "dark";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[11px] ${dark ? "text-background/60" : "text-muted-foreground"}`}>
        Preview as
      </span>
      <div className={`flex overflow-hidden rounded-sm border ${dark ? "border-background/25" : "border-border"}`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setOverride(override === o.value ? null : o.value)}
            className={`px-2 py-1 text-[11px] transition-colors ${
              override === o.value
                ? "bg-accent text-accent-foreground"
                : dark
                  ? "text-background/70 hover:text-background"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
