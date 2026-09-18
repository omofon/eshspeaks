"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { LogoWordmark } from "./Logo";

type Size = "xs" | "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  xs: "w-[90px]",
  sm: "w-[110px]",
  md: "w-[140px]",
  lg: "w-[180px] md:w-[210px]",
};

/**
 * The Colouresh masthead logo button.
 */
export function WhiteLogo({
  size = "md",
  asLink = true,
  className = "",
}: {
  size?: Size;
  asLink?: boolean;
  className?: string;
}) {
  const router = useRouter();

  const content = (
    <span className={`inline-flex cursor-pointer ${className}`}>
      <LogoWordmark className={sizes[size]} priority />
    </span>
  );

  if (!asLink) return content;

  return (
    <button
      type="button"
      aria-label="Colouresh home"
      onClick={() => router.push("/")}
      className="inline-flex cursor-pointer items-center justify-center rounded-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
    >
      {content}
    </button>
  );
}

export default WhiteLogo;
