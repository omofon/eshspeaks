"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthError } from "@/lib/authService";

const PATTERN = /^[A-Za-z0-9_]{3,20}$/;
const RESERVED = new Set([
  "admin",
  "eshspeaks",
  "support",
  "help",
  "about",
  "login",
  "register",
  "verify",
  "account",
  "api",
  "www",
  "news",
  "editor",
  "staff",
  "moderator",
  "root",
  "official",
]);

type Check =
  | { state: "idle" }
  | { state: "invalid"; message: string }
  | { state: "checking" }
  | { state: "available" }
  | { state: "taken"; message: string }
  | { state: "error"; message: string };

export function UsernameForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const inputId = useId();
  const statusId = `${inputId}-status`;
  const [username, setUsername] = useState("");
  const [check, setCheck] = useState<Check>({ state: "idle" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const value = username.trim();
    if (!value) {
      setCheck({ state: "idle" });
      return;
    }
    if (!PATTERN.test(value)) {
      setCheck({
        state: "invalid",
        message: "Use 3\u201320 characters. Letters, numbers and underscores only.",
      });
      return;
    }
    if (RESERVED.has(value.toLowerCase())) {
      setCheck({ state: "taken", message: "That username is reserved." });
      return;
    }

    setCheck({ state: "checking" });
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(async () => {
      try {
        const res = await authService.checkUsername(value, controller.signal);
        setCheck(
          res.available
            ? { state: "available" }
            : { state: "taken", message: "That username is already taken." },
        );
      } catch (e) {
        if (controller.signal.aborted) return;
        setCheck({
          state: "error",
          message: e instanceof AuthError ? e.message : "Couldn't check that username.",
        });
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (check.state !== "available" || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await authService.setUsername(username.trim());
      const destination = returnTo && returnTo.startsWith("/") ? returnTo : "/account";
      router.replace(destination as `/${string}`);
    } catch (e) {
      setSaving(false);
      setSaveError(e instanceof AuthError ? e.message : "Couldn't save your username.");
    }
  }

  const tone =
    check.state === "available"
      ? "text-success"
      : check.state === "checking"
        ? "text-text-muted"
        : "text-error";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor={inputId}
          className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary"
        >
          Username
        </label>
        <div className="mt-2 flex h-12 items-center rounded-md border border-rule-strong bg-background focus-within:border-navy">
          <span aria-hidden="true" className="pl-4 pr-1 font-mono text-[16px] text-text-muted">
            @
          </span>
          <input
            id={inputId}
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
            required
            placeholder="username"
            aria-describedby={statusId}
            aria-invalid={check.state === "invalid" || check.state === "taken" ? true : undefined}
            className="h-full w-full rounded-r-md bg-transparent pr-4 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <p
          id={statusId}
          aria-live="polite"
          className={`mt-2 min-h-5 text-[13px] leading-5 ${tone}`}
        >
          {check.state === "checking" && "Checking\u2026"}
          {check.state === "available" && "\u2713 Username available"}
          {(check.state === "taken" || check.state === "invalid" || check.state === "error") &&
            check.message}
        </p>
      </div>

      {saveError ? (
        <p role="alert" className="text-[13px] leading-5 text-error">
          {saveError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={check.state !== "available" || saving}
        className="flex h-12 w-full items-center justify-center rounded-md bg-navy px-4 text-[15px] font-semibold text-text-inverse transition-colors hover:bg-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45"
      >
        {saving ? "Saving\u2026" : "Continue"}
      </button>
    </form>
  );
}

export default UsernameForm;
