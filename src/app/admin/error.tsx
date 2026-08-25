"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Scoped to /admin — separate from the root error.tsx because we can say
 * something more specific and useful here: article drafts autosave to this
 * browser's localStorage independently of render state (see
 * src/lib/storage/draftStorage.ts), so a crash in the editor UI doesn't
 * lose the draft the way it might elsewhere.
 */
export default function AdminError({
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
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <p className="kicker">Newsroom admin</p>
        <h1 className="headline-lg mt-3 text-navy">This screen hit a snag.</h1>
        <p className="mt-4 text-[15px] leading-7 text-text-secondary">
          Your draft autosaves to this browser as you work, independently of this error, so nothing
          you've written should be lost. Try again, or go back to your story list.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-text-secondary/70">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn-accent">
            Try again
          </button>
          <Link href="/admin/articles" className="btn-ghost">
            Back to newsroom admin
          </Link>
        </div>
      </div>
    </div>
  );
}
