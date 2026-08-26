"use client";

import { useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthProvider";
import { authService, AuthError, validateUsername } from "@/lib/auth/authService";
import { uploadAvatar, removeAvatar, UsersApiError } from "@/lib/api/users";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function ProfileSettings() {
  const { user, refresh } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [username, setUsername] = useState(user?.username ?? "");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSaved, setUsernameSaved] = useState(false);
  const inputId = useId();
  const trimmed = username.trim();
  const localUsernameError = useMemo(() => (trimmed ? validateUsername(trimmed) : null), [trimmed]);

  if (!user) return null;

  const usernameUnchanged = trimmed === (user.username ?? "");

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError("Use a JPEG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be 2MB or smaller.");
      return;
    }

    setAvatarBusy(true);
    try {
      await uploadAvatar(file);
      await refresh();
    } catch (err) {
      setAvatarError(err instanceof UsersApiError ? err.message : "Couldn't upload your photo.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      await removeAvatar();
      await refresh();
    } catch (err) {
      setAvatarError(err instanceof UsersApiError ? err.message : "Couldn't remove your photo.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed || localUsernameError || usernameUnchanged || savingUsername) return;
    setSavingUsername(true);
    setUsernameError(null);
    setUsernameSaved(false);
    try {
      await authService.setUsername(trimmed);
      await refresh();
      setUsernameSaved(true);
      window.setTimeout(() => setUsernameSaved(false), 2500);
    } catch (err) {
      setUsernameError(err instanceof AuthError ? err.message : "Couldn't save your username.");
    } finally {
      setSavingUsername(false);
    }
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h2 className="font-serif text-2xl text-brand-navy">Profile</h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="text-lg font-semibold text-brand-navy">
              {(user.displayName ?? user.username ?? user.email)[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {avatarBusy ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-navy/50">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={avatarBusy}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-brand-navy transition-colors hover:border-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" />
              Change photo
            </button>
            {user.avatarUrl ? (
              <button
                type="button"
                disabled={avatarBusy}
                onClick={() => void handleRemoveAvatar()}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-error hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-xs text-text-secondary">JPEG, PNG, WebP or AVIF. Up to 2MB.</p>
          {avatarError ? <p className="text-xs text-error">{avatarError}</p> : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => void handleAvatarChange(e)}
        />
      </div>

      <form onSubmit={handleUsernameSubmit} className="mt-6 max-w-sm">
        <label
          htmlFor={inputId}
          className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary"
        >
          Username
        </label>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-10 flex-1 items-center rounded-md border border-border bg-background focus-within:border-navy">
            <span aria-hidden className="pl-3 pr-0.5 font-mono text-sm text-text-muted">
              @
            </span>
            <input
              id={inputId}
              value={username}
              onChange={(e) => {
                setUsernameError(null);
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
              }}
              maxLength={30}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className="h-full w-full rounded-r-md bg-transparent pr-3 text-sm text-text-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={
              !trimmed || Boolean(localUsernameError) || usernameUnchanged || savingUsername
            }
            className="h-10 shrink-0 rounded-md bg-navy px-4 text-xs font-semibold text-text-inverse transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-45"
          >
            {savingUsername ? "Saving…" : "Save"}
          </button>
        </div>
        <p className="mt-2 min-h-4 text-xs text-text-secondary">
          {usernameError ? (
            <span className="text-error">{usernameError}</span>
          ) : localUsernameError && trimmed ? (
            <span className="text-error">{localUsernameError}</span>
          ) : usernameSaved ? (
            <span className="text-accent">Username updated.</span>
          ) : (
            "3–30 characters. Lower-case letters, numbers and single underscores."
          )}
        </p>
      </form>
    </div>
  );
}
