"use client";

import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthError } from "@/lib/auth/authService";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSafeReturnTo } from "@/lib/auth/returnTo";
export { maskEmail } from "@/lib/auth/maskEmail";

const LENGTH = 6;
const RESEND_SECONDS = 60;

export function OTPForm({
  email,
  returnTo,
  action,
  mode = "login",
}: {
  email: string;
  returnTo?: string;
  action?: string;
  mode?: "login" | "register";
}) {
  const router = useRouter();
  const { refresh: refreshAuth } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const submit = useCallback(
    async (code: string) => {
      setStatus("verifying");
      setError(null);
      const safeReturnTo = getSafeReturnTo(returnTo);
      try {
        const session = await authService.verifyEmailCode(email, code, { returnTo: safeReturnTo, action });
        setStatus("success");

        // Push the new session into AuthProvider immediately so header/nav
        // reflect signed-in state without waiting for the next navigation
        // to remount the provider.
        void refreshAuth();

        // Decide by the actual data, not the server's onboarding.required
        // flag alone: a RETURNING user (username already set) should go to
        // their original destination, never back through /username. This
        // matters if onboarding.required and user.username ever drift —
        // username is the ground truth here, not the flag that was
        // computed from it server-side at signup time.
        if (!session.user.username) {
          const params = new URLSearchParams();
          if (safeReturnTo !== "/") params.set("returnTo", safeReturnTo);
          if (action) params.set("action", action);
          const qs = params.toString();
          router.replace(`/username${qs ? `?${qs}` : ""}`);
        } else {
          router.replace(safeReturnTo);
        }
      } catch (e) {
        setStatus("idle");
        setDigits(Array(LENGTH).fill(""));
        refs.current[0]?.focus();
        if (e instanceof AuthError) setError(e.message);
        else setError("Something went wrong. Please try again.");
      }
    },
    [action, email, returnTo, router, refreshAuth],
  );

  function setDigit(index: number, value: string) {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    const code = next.join("");
    if (value && index < LENGTH - 1) refs.current[index + 1]?.focus();
    if (code.length === LENGTH && next.every(Boolean)) void submit(code);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < LENGTH - 1) refs.current[index + 1]?.focus();
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const next = Array(LENGTH)
      .fill("")
      .map((_, i) => pasted[i] ?? "");
    setDigits(next);
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
    if (pasted.length === LENGTH) void submit(pasted);
  }

  async function resend() {
    setResending(true);
    setError(null);
    try {
      await authService.resendEmailCode(email, { returnTo: getSafeReturnTo(returnTo), action });
      setCountdown(RESEND_SECONDS);
    } catch (e) {
      if (e instanceof AuthError && e.kind === "rate_limited") {
        setCountdown(e.retryAfter ?? RESEND_SECONDS);
        setError("You can only request one code a minute.");
      } else {
        setError(e instanceof AuthError ? e.message : "Couldn't resend the code.");
      }
    } finally {
      setResending(false);
    }
  }

  const disabled = status !== "idle";

  const differentEmailHref = (() => {
    const params = new URLSearchParams();
    if (mode === "register") params.set("mode", "register");
    const safeReturnTo = getSafeReturnTo(returnTo);
    if (safeReturnTo !== "/") params.set("returnTo", safeReturnTo);
    if (action) params.set("action", action);
    const qs = params.toString();
    return `/login${qs ? `?${qs}` : ""}`;
  })();

  return (
    <div>
      <div className="flex justify-between gap-2" onPaste={onPaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={digit}
            onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(-1))}
            onKeyDown={(e) => onKeyDown(i, e)}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${LENGTH}`}
            aria-invalid={error ? true : undefined}
            className="h-14 w-full max-w-[54px] rounded-md border border-rule-strong bg-background text-center font-mono text-[20px] text-text-primary focus:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60 aria-[invalid=true]:border-error"
          />
        ))}
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-[13px] leading-5 text-error">
        {error}
      </p>
      <p aria-live="polite" className="text-[13px] leading-5 text-text-secondary">
        {status === "verifying" ? "Verifying your code\u2026" : status === "success" ? "Verified. Taking you through\u2026" : ""}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        {countdown > 0 ? (
          <span className="text-text-muted">Resend code in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="font-semibold text-accent underline underline-offset-2 hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {resending ? "Sending\u2026" : "Resend code"}
          </button>
        )}
        <a href={differentEmailHref} className="text-text-secondary underline underline-offset-2 hover:text-navy">
          Use a different email
        </a>
      </div>
    </div>
  );
}

export default OTPForm;