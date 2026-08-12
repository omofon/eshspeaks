"use client";

import { useState } from "react";
import { authService, AuthError } from "@/lib/authService";

const base =
  "flex h-12 w-full items-center justify-center gap-3 rounded-md border border-rule-strong bg-card px-4 text-[15px] font-medium text-navy transition-colors hover:bg-navy-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.95a9 9 0 0 0 0 8.1l3.02-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" width="17" height="20" viewBox="0 0 17 20" fill="currentColor">
      <path d="M14.09 10.62c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.87-.76-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.75 2.2 1.1-.04 1.52-.71 2.86-.71 1.33 0 1.71.71 2.87.69 1.19-.02 1.94-1.08 2.66-2.14.84-1.23 1.19-2.42 1.2-2.48-.02-.01-2.3-.89-2.32-3.5ZM11.9 3.9c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.56 1.31-.56.65-1.06 1.69-.93 2.68.98.08 1.98-.5 2.59-1.22Z" />
    </svg>
  );
}

export function SocialAuthButtons({ returnTo }: { returnTo?: string }) {
  const [pending, setPending] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = (provider: "google" | "apple") => {
    setError(null);
    setPending(provider);
    try {
      if (provider === "google") authService.loginWithGoogle(returnTo);
      else authService.loginWithApple(returnTo);
    } catch (e) {
      setPending(null);
      setError(e instanceof AuthError ? e.message : "Couldn't start sign-in. Try again.");
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={base}
        onClick={() => go("google")}
        disabled={pending !== null}
      >
        <GoogleIcon />
        <span>{pending === "google" ? "Redirecting to Google\u2026" : "Continue with Google"}</span>
      </button>
      <button
        type="button"
        className={base}
        onClick={() => go("apple")}
        disabled={pending !== null}
      >
        <AppleIcon />
        <span>{pending === "apple" ? "Redirecting to Apple\u2026" : "Continue with Apple"}</span>
      </button>
      {error ? (
        <p role="alert" className="text-[13px] leading-5 text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default SocialAuthButtons;
