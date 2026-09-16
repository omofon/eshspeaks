"use client";

import { useState, type FormEvent } from "react";

/**
 * No backend endpoint for desk-launch notifications exists (these desks
 * don't exist on the backend at all yet) — same honest-fake-success
 * pattern as NewsletterSignup until one does.
 */
export function NotifyMeForm() {
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

  if (done) {
    return <p className="mt-6 font-semibold text-ink">We will email you the moment this opens.</p>;
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2.5">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={error ? "Enter a valid email first…" : "Email address"}
        aria-label="Email address"
        className={`min-w-[200px] flex-1 rounded-full border-2 px-4.5 py-3 text-sm outline-none ${
          error ? "border-red" : "border-ink"
        }`}
      />
      <button type="submit" className="btn-accent">
        Notify Me
      </button>
    </form>
  );
}
