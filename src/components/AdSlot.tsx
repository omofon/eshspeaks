"use client";

import { useAuth } from "@/lib/auth/AuthProvider";

type Variant = "leaderboard" | "in-feed" | "sidebar";

const sizes: Record<Variant, string> = {
  leaderboard: "h-24",
  "in-feed": "h-28",
  sidebar: "h-64",
};

export function AdSlot({ variant = "in-feed" }: { variant?: Variant }) {
  const { isSubscriber } = useAuth();
  if (isSubscriber) return null;
  return (
    <div
      className={`flex w-full items-center justify-center rounded-sm border border-dashed border-rule bg-muted ${sizes[variant]}`}
    >
      <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
        Advertisement · {variant} placeholder
      </span>
    </div>
  );
}
