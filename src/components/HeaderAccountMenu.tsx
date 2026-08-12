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
import { useAuth } from "@/lib/auth";

export function HeaderAccountMenu() {
  const { user, isAuthenticated, signOut } = useAuth();

  const label = user ? user.name.split(" ")[0] : "Account";

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
                <p className="text-base font-semibold text-brand-navy">{user.name}</p>
                <p className="text-sm text-text-secondary">{user.email}</p>
                {user.subscription === "premium" ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Premium member
                  </p>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex w-full cursor-pointer items-center gap-2">
                <UserRound className="h-4 w-4" />
                View profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex w-full cursor-pointer items-center gap-2">
                <UserRound className="h-4 w-4" />
                Manage account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/pricing" className="flex w-full cursor-pointer items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Manage subscription
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex w-full cursor-pointer items-center gap-2">
                <CircleUserRound className="h-4 w-4" />
                Saved articles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
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
