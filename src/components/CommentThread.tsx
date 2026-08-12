"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { mockComments } from "@/lib/data/comments";
import { useTier } from "@/lib/tier";

interface LocalComment {
  id: string;
  author: string;
  initials: string;
  time: string;
  body: string;
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-navy font-mono text-[11px] text-background">
      {initials}
    </span>
  );
}

export function CommentThread({ count }: { count: number }) {
  const { isLoggedIn } = useTier();
  const [posted, setPosted] = useState<LocalComment[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (draft.trim().length < 10) {
      setError("Comments need at least 10 characters.");
      return;
    }
    setError("");
    setPosted((prev) => [
      {
        id: `local-${prev.length}`,
        author: "You",
        initials: "YO",
        time: "Just now",
        body: draft.trim(),
      },
      ...prev,
    ]);
    setDraft("");
  }

  return (
    <section id="comments" className="mt-12">
      <h2 className="font-serif text-2xl text-navy">Comments ({count + posted.length})</h2>

      {isLoggedIn ? (
        <form onSubmit={submit} className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Add to the discussion"
            aria-label="Post a comment"
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {error ? <p className="mt-1 text-sm text-down">{error}</p> : null}
          <button
            type="submit"
            className="mt-2 rounded-sm bg-navy px-4 py-2 text-sm font-medium text-background hover:bg-accent"
          >
            Post comment
          </button>
        </form>
      ) : (
        <div className="mt-4 rounded-sm border border-border bg-card p-4 text-sm">
          <p className="text-muted-foreground">
            Sign in to join the discussion.{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/login?mode=register" className="text-accent hover:underline">
              create an account
            </Link>
            .
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-6">
        {posted.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar initials={c.initials} />
            <div>
              <p className="text-sm font-medium text-navy">
                {c.author} <span className="font-normal text-muted-foreground">· {c.time}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed">{c.body}</p>
            </div>
          </li>
        ))}
        {mockComments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar initials={c.initials} />
            <div className="w-full">
              <p className="text-sm font-medium text-navy">
                {c.author} <span className="font-normal text-muted-foreground">· {c.time}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed">{c.body}</p>
              {c.replies && c.replies.length > 0 ? (
                <ul className="mt-4 space-y-4 border-l border-border pl-4">
                  {c.replies.map((r) => (
                    <li key={r.id} className="flex gap-3">
                      <Avatar initials={r.initials} />
                      <div>
                        <p className="text-sm font-medium text-navy">
                          {r.author}{" "}
                          <span className="font-normal text-muted-foreground">· {r.time}</span>
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">{r.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
