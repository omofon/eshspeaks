"use client";

import Link from "next/link";
import { CircleUserRound, LogOut, ShieldCheck, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/AuthProvider";

/** Anything above plain reader gets a link into the newsroom admin area. */
const EDITORIAL_ROLES = [
  "contributor",
  "state_correspondent",
  "section_lead",
  "chief_editor",
] as const;

export function HeaderAccountMenu() {
  const { user, isAuthenticated, isSubscriber, hasRole, signOut } = useAuth();
  const label = user?.displayName ?? user?.username ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={isAuthenticated ? "Open account menu" : "Open sign in menu"}
          className="inline-flex items-center justify-center rounded-full border border-text-inverse/30 p-2 text-text-inverse transition-colors hover:border-text-inverse hover:text-accent"
        >
          <CircleUserRound className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-md border border-border bg-background-soft p-2 shadow-raised"
      >
        {isAuthenticated && user ? (
          <>
            <DropdownMenuLabel className="px-2 pb-2 pt-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-brand-navy">{label}</p>
                  {isSubscriber ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                      Premium
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex w-full cursor-pointer items-center gap-2">
                <UserRound className="h-4 w-4" />
                Manage account
              </Link>
            </DropdownMenuItem>
            {hasRole(EDITORIAL_ROLES) ? (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex w-full cursor-pointer items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Newsroom admin
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void signOut()}
              className="flex cursor-pointer items-center gap-2 text-brand-navy"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="px-2 pb-2 pt-1">
              <div className="space-y-2">
                <p className="text-base font-semibold text-brand-navy">Welcome to EshSpeaks</p>
                <p className="text-sm text-text-secondary">
                  Sign in to continue reading and commenting.
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="flex w-full cursor-pointer items-center gap-2">
                <UserRound className="h-4 w-4" />
                Sign in
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default HeaderAccountMenu;
