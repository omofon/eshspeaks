"use client";

import { useState, type FormEvent } from "react";

/**
 * Per-desk newsletter card ("The Morning Brief", "The Bag, Weekly", ...).
 * Same honest-fake-success pattern as NewsletterSignup — no per-section
 * subscribe endpoint exists yet (see CMS-BACKEND-REQUESTS-2 B2), so this
 * validates and confirms locally rather than pretending to call one.
 */
export function SectionBrief({
  title,
  description,
  background,
  textColor,
  accent,
  accentDeep,
}: {
  title: string;
  description: string;
  background: string;
  textColor: string;
  accent: string;
  accentDeep: string;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError(true);
      return;
    }
    setError(false);
    setDone(true);
  }

  return (
    <div className="rounded-2xl border-2 border-ink p-5" style={{ background, color: textColor }}>
      {done ? (
        <>
          <h4 className="text-[15px] font-semibold" style={{ color: textColor }}>
            {title}
          </h4>
          <p className="mt-2 text-xs opacity-80">You are on the list.</p>
        </>
      ) : (
        <>
          <h4 className="mb-1.5 text-[15px] font-semibold" style={{ color: textColor }}>
            {title}
          </h4>
          <p className="mb-3.5 text-xs opacity-65">{description}</p>
          <form onSubmit={submit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={error ? "Enter a valid email first…" : "Email address"}
              aria-label="Email address"
              className="mb-2.5 w-full rounded-full border-none px-4 py-2.5 text-[13px] text-ink outline-none"
              style={{ borderColor: error ? "var(--red)" : undefined }}
            />
            <button
              type="submit"
              className="w-full rounded-full py-2.5 text-[13px] font-bold text-white"
              style={{ background: accent, boxShadow: `0 4px 0 ${accentDeep}` }}
            >
              Subscribe
            </button>
          </form>
        </>
      )}
    </div>
  );
}
