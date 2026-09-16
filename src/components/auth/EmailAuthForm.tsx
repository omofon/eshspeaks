"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { authService, AuthError, isValidEmail } from "@/lib/auth/authService";
import { getSafeReturnTo } from "@/lib/auth/returnTo";
import {
  authFieldClass,
  authMicroLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/authTheme";

type Mode = "register" | "login";

export function EmailAuthForm({
  mode,
  returnTo,
  action,
}: {
  mode: Mode;
  returnTo?: string;
  action?: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<{ message: string; hint?: "sign-in" | "register" } | null>(
    null,
  );

  const trimmed = email.trim();
  const showInvalid = touched && trimmed.length > 0 && !isValidEmail(trimmed);
  const canSubmit = isValidEmail(trimmed) && status !== "loading";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setError(null);
    setStatus("loading");
    try {
      // Normalize once, use everywhere below — never forward the raw prop.
      const safeReturnTo = getSafeReturnTo(returnTo);

      // Enumeration-safe: the API returns 200 whether or not the account exists.
      await authService.requestEmailCode(trimmed, { returnTo: safeReturnTo, action });

      setStatus("sent");
      const params = new URLSearchParams({ email: trimmed });
      if (safeReturnTo !== "/") params.set("returnTo", safeReturnTo);
      if (action) params.set("action", action);
      router.push(`/verify?${params.toString()}`);
    } catch (e) {
      setStatus("idle");
      if (e instanceof AuthError) {
        if (e.kind === "rate_limited") {
          setError({
            message: e.retryAfter
              ? `Too many requests. Try again in ${e.retryAfter}s.`
              : "Too many requests. Wait a minute and try again.",
          });
        } else {
          setError({ message: e.message });
        }
      } else {
        setError({ message: "Something went wrong. Please try again." });
      }
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor={inputId} className={authMicroLabelClass}>
          Email address
        </label>
        <div className="relative mt-2">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft"
          />
          <input
            id={inputId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            placeholder="you@example.com"
            aria-label="Email address"
            aria-invalid={showInvalid || Boolean(error) ? true : undefined}
            aria-describedby={showInvalid || error ? errorId : undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={status === "loading"}
            className={`${authFieldClass} pl-11 pr-4`}
          />
        </div>
        {/* Error message */}
        <div className="mt-1">
          {error ? (
            <p id={errorId} role="alert" className="text-[13px] leading-5 text-error">
              {error.message}{" "}
              {error.hint === "sign-in" ? (
                <a href="/login" className="font-semibold underline underline-offset-2">
                  Sign in instead
                </a>
              ) : null}
              {error.hint === "register" ? (
                <a href="/register" className="font-semibold underline underline-offset-2">
                  Create an account
                </a>
              ) : null}
            </p>
          ) : showInvalid ? (
            <p id={errorId} role="alert" className="text-[13px] leading-5 text-error">
              Enter a valid email address.
            </p>
          ) : null}
        </div>
      </div>

      <button type="submit" disabled={!canSubmit} className={authPrimaryButtonClass}>
        {status === "loading" ? (
          "Sending code…"
        ) : status === "sent" ? (
          "Code sent"
        ) : (
          <>
            Sign in
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>

      <p aria-live="polite" className="sr-only">
        {status === "loading" ? "Submitting" : status === "sent" ? "Verification code sent" : ""}
      </p>
    </form>
  );
}

export default EmailAuthForm;
