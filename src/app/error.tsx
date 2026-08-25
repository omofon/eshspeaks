"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WhiteLogo } from "@/components/layout/whiteLogo";

/**
 * Route-segment error boundary — catches render/render-time errors anywhere
 * under the root layout (AuthProvider, cookie UI, and fonts still render
 * normally, since only the segment tree below this boundary is replaced).
 * Never render `error.message` — it can carry backend response text or
 * other implementation detail; `error.digest` (if present) is safe, it's
 * just a correlation id for server logs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-eshspeaks py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <WhiteLogo size="md" inverted={false} asLink={false} />
        </div>

        <p className="kicker mt-10">Something went wrong</p>
        <h1 className="headline-lg mt-3 text-navy">This page hit a snag.</h1>
        <p className="mt-4 text-[17px] leading-8 text-text-secondary">
          Nothing was lost — try again, or head back to the front page. If this keeps happening, let
          us know what you were doing when it broke.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-text-secondary/70">Ref: {error.digest}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn-accent">
            Try again
          </button>
          <Link href="/" className="btn-ghost">
            Go to the front page
          </Link>
        </div>
      </div>
    </div>
  );
}
