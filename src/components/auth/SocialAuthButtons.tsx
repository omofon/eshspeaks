"use client";

import { authService } from "@/lib/auth/authService";

/**
 * Google sign-in is a full-page navigation to GET /api/v1/auth/google.
 * It must never be fetched — the endpoint 302s to Google.
 */
export function SocialAuthButtons({ returnTo, action }: { returnTo?: string; action?: string }) {
  const href = (() => {
    try {
      return authService.googleAuthUrl(returnTo, action);
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-3">
      <a
        href={href ?? "#"}
        aria-disabled={href ? undefined : true}
        onClick={(e) => {
          if (!href) e.preventDefault();
        }}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-rule-strong bg-background px-4 text-[15px] font-semibold text-text-primary transition-colors hover:bg-background-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
      >
        <svg aria-hidden="true" viewBox="0 0 18 18" className="h-[18px] w-[18px]">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.94v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.94a9 9 0 0 0 0 8.1l3.03-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .94 4.95l3.03 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
        </svg>
        Continue with Google
      </a>
    </div>
  );
}

export default SocialAuthButtons;
