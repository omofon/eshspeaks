"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { HeaderAccountMenu } from "@/components/HeaderAccountMenu";
import { WhiteLogo } from "@/components/layout/whiteLogo";
import { SearchOverlay } from "@/components/SearchOverlay";

export function UtilityBar() {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    );
  }, []);

  return (
    <div className="hidden border-b border-text-inverse/15 bg-navy text-text-inverse md:block">
      <div className="container-eshspeaks grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2.5">
        <div className="flex items-center gap-4">
          <SearchOverlay inverted />
          <div className="flex flex-col leading-tight">
            <span className="meta text-text-inverse/70">{today || "\u00A0"}</span>
            <Link
              href="/"
              className="mt-0.5 cursor-pointer text-[12px] text-text-inverse/80 underline-offset-4 hover:text-accent hover:underline"
            >
              Today&rsquo;s edition
            </Link>
          </div>
        </div>

        <WhiteLogo size="lg" inverted />

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/pricing"
            className="btn-accent cursor-pointer px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
          >
            Subscribe
          </Link>
          <HeaderAccountMenu />
        </div>
      </div>
    </div>
  );
}

export default UtilityBar;
