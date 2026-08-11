"use client";

import Link from "next/link";
import React from "react";

export function Masthead() {
  return (
    <div className="bg-navy text-background">
      <div className="container-eshspeaks flex items-center justify-center py-6">
        <Link href="/" className="tracking-tight text-3xl md:text-4xl" style={{ fontFamily: "var(--font-bodoni)" }}>
          <span className="not-italic">EshSpeaks</span>
        </Link>
      </div>
      <div className="border-t border-navy-soft" />
    </div>
  );
}

export default Masthead;
