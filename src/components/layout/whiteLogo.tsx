"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import LogoBlueHorizontal from "@/assets/logo_blue_horizontal.png";
import LogoWhiteHorizontal from "@/assets/logo_white_horizontal.png";

type Size = "xs" | "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  xs: "w-[90px]",
  sm: "w-[132px]",
  md: "w-[172px]",
  lg: "w-[220px] md:w-[260px]",
};

/**
 * The ESHSPEAKS masthead logo button.
 */
export function WhiteLogo({
  size = "md",
  inverted = true,
  asLink = true,
  className = "",
}: {
  size?: Size;
  inverted?: boolean;
  asLink?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const logo = inverted ? LogoWhiteHorizontal : LogoBlueHorizontal;

  const content = (
    <span className={`inline-flex cursor-pointer ${sizes[size]} ${className}`}>
      <Image src={logo} alt="EshSpeaks" className="h-auto w-full" priority />
    </span>
  );

  if (!asLink) return content;

  return (
    <button
      type="button"
      aria-label="EshSpeaks home"
      onClick={() => router.push("/")}
      className="inline-flex cursor-pointer items-center justify-center rounded-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
    >
      {content}
    </button>
  );
}

export default WhiteLogo;
