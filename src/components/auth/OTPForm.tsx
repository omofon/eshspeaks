"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { authService, AuthError } from "@/lib/authService";

const LENGTH = 6;
const RESEND_SECONDS = 45;

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

export function OTPForm({
  email,
  returnTo,
  action,
  mode,
}: {
  email: string;
  returnTo?: string;
  action?: string;
  mode?: "login" | "register";
}) {
  const router = useRouter();
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
      try {
        await authService.verifyOTP(email, code);
        const user = await authService.getCurrentUser();
        setStatus("success");
        const needsUsername = !user.username && action === "comment";
        if (needsUsername) {
          const params = new URLSearchParams();
          if (returnTo) params.set("returnTo", returnTo);
          if (action) params.set("action", action);
          router.replace(`/username${params.size ? `?${params.toString()}` : ""}`);
        } else {
          const destination = returnTo && returnTo.startsWith("/") ? returnTo : "/account";
          router.replace(destination as `/${string}`);
        }
      } catch (e) {
        setStatus("idle");
        setDigits(Array(LENGTH).fill(""));
        refs.current[0]?.focus();
        if (e instanceof AuthError) {
          if (e.kind === "expired_code") setError("That code has expired. Request a new one.");
          else if (e.kind === "invalid_code")
            setError("That code isn't right. Check it and try again.");
          else setError(e.message);
        } else setError("Something went wrong. Please try again.");
      }
    },
    [action, email, returnTo, router],
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
      await authService.resendOTP(email);
      setCountdown(RESEND_SECONDS);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  }

  const disabled = status !== "idle";

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
        {status === "verifying"
          ? "Verifying your code\u2026"
          : status === "success"
            ? "Verified. Taking you through\u2026"
            : ""}
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
        <a
          href={`/login${mode === "register" ? "?mode=register" : ""}`}
          className="text-text-secondary underline underline-offset-2 hover:text-navy"
        >
          Use a different email
        </a>
      </div>
    </div>
  );
}

export default OTPForm;
