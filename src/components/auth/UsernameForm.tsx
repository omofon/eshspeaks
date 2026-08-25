"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthError, validateUsername } from "@/lib/auth/authService";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSafeReturnTo } from "@/lib/auth/returnTo";

export function UsernameForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const { refresh: refreshAuth } = useAuth();
  const inputId = useId();
  const statusId = `${inputId}-status`;
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const value = username.trim();
  const localError = useMemo(() => (value ? validateUsername(value) : null), [value]);
  const canSubmit = Boolean(value) && !localError && !saving;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setServerError(null);
    try {
      await authService.setUsername(value);
      void refreshAuth(); // push updated user (now has a username) into AuthProvider
      router.replace(getSafeReturnTo(returnTo));
    } catch (e) {
      setSaving(false);
      if (e instanceof AuthError) {
        if (e.kind === "unauthorized") {
          router.replace("/login");
          return;
        }
        setServerError(e.message);
      } else {
        setServerError("Couldn't save your username.");
      }
    }
  }

  const message = serverError ?? localError;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor={inputId} className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
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
            onChange={(e) => {
              setServerError(null);
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
            }}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={30}
            required
            placeholder="username"
            aria-describedby={statusId}
            aria-invalid={message ? true : undefined}
            className="h-full w-full rounded-r-md bg-transparent pr-4 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <p
          id={statusId}
          aria-live="polite"
          className={`mt-2 min-h-5 text-[13px] leading-5 ${message ? "text-error" : "text-text-muted"}`}
        >
          {message ?? "3\u201330 characters. Lower-case letters, numbers and single underscores."}
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-12 w-full items-center justify-center rounded-md bg-navy px-4 text-[15px] font-semibold text-text-inverse transition-colors hover:bg-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45"
      >
        {saving ? "Saving\u2026" : "Continue"}
      </button>
    </form>
  );
}

export default UsernameForm;